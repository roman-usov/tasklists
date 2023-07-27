// @ts-check
/* eslint-disable no-param-reassign */

import uniqueId from 'lodash/uniqueId.js';

function createHref(name) {
  return `#${name.toLowerCase().split(' ').join('-')}`;
}

function trim(str) {
  const regex = /[ ]{2,}/g;
  return str.trim().replace(regex, ' ');
}

function createState() {
  const defaultTaskList = 'General';

  const tasklists = [
    {
      id: uniqueId(),
      selected: true,
      name: defaultTaskList,
      href: createHref(defaultTaskList),
    },
  ];

  const tasks = [];

  return {
    getTasksByTaskListId(id) {
      return tasks.filter((task) => task.taskListId === id);
    },

    getTaskLists() {
      return tasklists;
    },

    createTask(taskName, taskListId) {
      const task = {
        id: uniqueId(),
        taskListId,
        name: taskName,
      };

      tasks.push(task);
    },

    createTaskList(taskListName) {
      const taskList = {
        id: uniqueId(),
        selected: false,
        name: taskListName,
        href: createHref(taskListName),
      };

      tasklists.push(taskList);
    },

    makeTaskListSelected(id) {
      const currentlySelectedTaskList = tasklists.find((list) => list.selected);
      const taskListToSelect = tasklists.find((list) => list.id === id);

      if (currentlySelectedTaskList) {
        currentlySelectedTaskList.selected = false;
      }

      if (taskListToSelect) {
        taskListToSelect.selected = true;
      }
    },

    getSelectedTaskList() {
      return tasklists.find((list) => list.selected);
    },

    isDuplicate(taskListName) {
      return !!tasklists.find((list) => list.name === taskListName);
    },
  };
}

function createTaskItem({ name }) {
  const taskItemEl = document.createElement('li');
  taskItemEl.textContent = name;

  return taskItemEl;
}

function createListItem({
  name,
  id,
  selected,
  href,
}) {
  const listItemEl = document.createElement('li');

  const listItemContent = name;
  listItemEl.dataset.id = id;

  let contentElToAppend;

  if (selected) {
    const bEl = document.createElement('b');

    bEl.textContent = listItemContent;
    contentElToAppend = bEl;
  } else {
    const aEl = document.createElement('a');

    aEl.setAttribute('href', href);
    aEl.textContent = listItemContent;
    contentElToAppend = aEl;
  }

  listItemEl.append(contentElToAppend);

  return listItemEl;
}

function renderTasks(state) {
  const taskContainerEl = document.querySelector('[data-container="tasks"]');

  if (taskContainerEl) {
    taskContainerEl.innerHTML = '';
  }

  const { id } = state.getSelectedTaskList();
  const selectedTasks = state.getTasksByTaskListId(id);

  if (selectedTasks.length > 0) {
    const tasksEl = document.createElement('ul');

    selectedTasks.forEach((task) => {
      tasksEl.append(createTaskItem(task));
    });

    taskContainerEl?.append(tasksEl);
  }
}

function renderLists(state) {
  const taskListContainerEl = document.querySelector(
    '[data-container="lists"]',
  );

  if (taskListContainerEl) {
    taskListContainerEl.innerHTML = '';
  }

  const taskListEl = document.createElement('ul');

  const taskLists = state.getTaskLists();

  taskLists.forEach((list) => {
    taskListEl.append(createListItem(list));
  });

  taskListContainerEl?.append(taskListEl);
}

function render(state) {
  renderLists(state);
  renderTasks(state);
}

function handleAddItemToList(state, e) {
  e.preventDefault();

  const formEl = e.target;

  const type = formEl.dataset.container;

  const formData = new FormData(formEl);

  const submittedValue = trim(formData.get('name'));

  const formHandlers = {
    'new-list-form': () => {
      if (state.isDuplicate(submittedValue)) {
        formEl.reset();
        return;
      }

      state.createTaskList(submittedValue);
    },
    'new-task-form': () => {
      const selectedTaskList = state.getSelectedTaskList();

      if (selectedTaskList) {
        const { id } = selectedTaskList;
        state.createTask(submittedValue, id);
      }
    },
  };

  formHandlers[type]();

  render(state);

  formEl.reset();
}

function handleSelectList(state, e) {
  const link = e.target;

  if (link.tagName !== 'A') return;

  const dataContainer = link.closest('li');

  const listId = dataContainer.dataset.id;

  state.makeTaskListSelected(listId);

  render(state);
}

function addHandlerToAddElementToList(handler, state) {
  const submitFormEls = document.querySelectorAll('form');

  submitFormEls.forEach((formEl) => {
    formEl?.addEventListener('submit', handler.bind(null, state));
  });
}

function addHandlerToSelectList(handler, state) {
  const taskListEl = document.querySelector('[data-container="lists"]');

  taskListEl?.addEventListener('click', handler.bind(null, state));
}

export default function app() {
  const initialState = createState();

  addHandlerToAddElementToList(handleAddItemToList, initialState);

  addHandlerToSelectList(handleSelectList, initialState);

  render(initialState);
}

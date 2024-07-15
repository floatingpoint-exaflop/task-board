// ? Grab references to the input DOM elements.
const taskNameInputEl = $('#task-name-input');
const taskDescInputEl = $('#task-desc-input');
const taskDateInputEl = $('#taskDueDate');

// ? Reads tasks from localStorage and returns array of task objects - empty if localStorage has no tasks.
function readTasksFromStorage() {
  // ? Retrieve tasks from localStorage and make array
  let tasks = JSON.parse(localStorage.getItem('tasks'));

  // ? If no tasks were retrieved from localStorage, assign tasks to a new empty array to push to later.
  if (!tasks) {
    tasks = [];
  }

  // ? Return the tasks array either empty or with data in it whichever it was determined to be by the logic right above.
  return tasks;
}

// ? Accepts and stringifys an array of tasks to localStorage.
function saveTasksToStorage(tasks) {
  localStorage.setItem('tasks', JSON.stringify(tasks));
}

// ? Create the task card from submitted data.
function createTaskCard(task) {
  const taskCard = $('<div>')
    .addClass('card task-card draggable my-3')
    .attr('data-task-id', task.id);
  const cardHeader = $('<div>').addClass('card-header h4').text(task.name);
  const cardBody = $('<div>').addClass('card-body');
  const cardDescription = $('<p>').addClass('card-text').text(task.type);
  const cardDueDate = $('<p>').addClass('card-text').text(task.dueDate);
  const cardDeleteBtn = $('<button>')
    .addClass('btn btn-danger delete')
    .text('Delete')
    .attr('data-task-id', task.id);
  cardDeleteBtn.on('click', handleDeleteTask);

  // ? Yellow for due today cards, Red if overdue.
  if (task.dueDate && task.status !== 'done') {
    const now = dayjs();
    const taskDueDate = dayjs(task.dueDate, 'DD/MM/YYYY');
    if (now.isSame(taskDueDate, 'day')) {
      taskCard.addClass('bg-warning text-white');
    } else if (now.isAfter(taskDueDate)) {
      taskCard.addClass('bg-danger text-white');
      cardDeleteBtn.addClass('border-light');
    }
  }

  // ? Gather all card elements and append to DOM.
  cardBody.append(cardDescription, cardDueDate, cardDeleteBtn);
  taskCard.append(cardHeader, cardBody);

  // ? Return the card to allow append if it moves.
  return taskCard;
}

function printTaskData() {
  const tasks = readTasksFromStorage();

  // ? Clear lanes
  const todoList = $('#todo-cards');
  todoList.empty();

  const inProgressList = $('#in-progress-cards');
  inProgressList.empty();

  const doneList = $('#done-cards');
  doneList.empty();

  // ? Loop thru tasks and to get task cards
  for (let task of tasks) {
    if (task.status === 'to-do') {
      todoList.append(createTaskCard(task));
    } else if (task.status === 'in-progress') {
      inProgressList.append(createTaskCard(task));
    } else if (task.status === 'done') {
      doneList.append(createTaskCard(task));
    }
  }

  // ? Make cards draggable
  $('.draggable').draggable({
    opacity: 0.7,
    zIndex: 100,
    helper: function (e) {
      // ? Need this bit so any child element of the card is still dragging that card as a whole without causing bugs.
      const original = $(e.target).hasClass('ui-draggable')
        ? $(e.target)
        : $(e.target).closest('.ui-draggable');
      // ? Fixes width
      return original.clone().css({
        width: original.outerWidth(),
      });
    },
  });
}

// ? Removes a task from local storage on demand and updates page
function handleDeleteTask() {
  const taskId = $(this).attr('data-task-id');
  const tasks = readTasksFromStorage();

  // ? Remove deleted task from array
  tasks.forEach((task) => {
    if (task.id === taskId) {
      tasks.splice(tasks.indexOf(task), 1);
    }
  });

  // ? We will use our helper function to save the tasks to localStorage
  saveTasksToStorage(tasks);

  // ? Here we use our other function to print tasks back to the screen
  printTaskData();
}

// ? Adds a task to local storage and prints the task data
function handleModalSubmit(event) {
  event.preventDefault();

  // Read user input from the form
  const taskName = taskNameInputEl.val().trim();
  const taskDesc = taskDescInputEl.val().trim(); // Don't need to trim select input
  const taskDate = taskDateInputEl.val(); // yyyy-mm-dd format

  const newTask = {
    // Generate a random id for the task
    id: crypto.randomUUID(),
    name: taskName,
    type: taskDesc,
    dueDate: taskDate,
    status: 'to-do',
  };

  // Pull the tasks from localStorage and push the new task to the array
  const tasks = readTasksFromStorage();
  tasks.push(newTask);

  // Save the updated tasks array to localStorage
  saveTasksToStorage(tasks);

  // Print task data back to the screen
  printTaskData();

  // Clear the form inputs
  taskNameInputEl.val('');
  taskDescInputEl.val('');
  taskDateInputEl.val('');

  // Hide the modal
  $('#formModal').modal('hide');
}

//Handles stuff that goes down when we drop a dragged task card
function handleDrop(event, ui) {
  // ? Get tasks
  const tasks = readTasksFromStorage();

  // ? Get the task id for the dropped card
  const taskId = ui.draggable[0].dataset.taskId;

  // ? Get lane id of the lane where we dropped card
  const newStatus = event.target.id;

  for (let task of tasks) {
    // ? match updated status to id
    if (task.id === taskId) {
      task.status = newStatus;
    }
  }
  // ? Overwrite localStorage with new tasks array & display updated task data.
  localStorage.setItem('tasks', JSON.stringify(tasks));
  printTaskData();
}


// ? Date picker, Print task data to screen, make lanes droppable.
$(document).ready(function () {
  printTaskData();

  // Initialize date picker
  $('#taskDueDate').datepicker({
    changeMonth: true,
    changeYear: true,
  });

  // Make lanes droppable
  $('.lane').droppable({
    accept: '.draggable',
    drop: handleDrop,
  });

  // Handle form submission
  $('#taskForm').on('submit', handleModalSubmit);
});
// Retrieve tasks and nextId from localStorage
let taskList = JSON.parse(localStorage.getItem("tasks"));
let nextId = JSON.parse(localStorage.getItem("nextId"));

// COMPLETED: Here we use a Web API called `crypto` to generate a random id for our task. This is a unique identifier that we can use to find the task in the array. `crypto` is a built-in module that we can use in the browser and Nodejs.
function generateTaskId(event) {
    event.preventDefault();

    // ? Read user input from the form
    const taskName = taskNameInputEl.val().trim();
    const taskDesc = taskDescInputEl.val(); // don't need to trim select input
    const taskDate = taskDateInputEl.val(); // yyyy-mm-dd format
  
    const newTask = {
      // ? Here we use a Web API called `crypto` to generate a random id for our task. This is a unique identifier that we can use to find the task in the array. `crypto` is a built-in module that we can use in the browser and Nodejs.    id: crypto.randomUUID(),
      id: crypto.randomUUID(),
      name: taskName,
      type: taskDesc,
      dueDate: taskDate,
      status: 'to-do',
    };
  
    // ? Pull the tasks from localStorage and push the new task to the array
    const taskList = readTasksFromStorage();
    taskList.push(newTask);
  
    // ? Save the updated tasks array to localStorage
    saveTasksToStorage(taskList);
  
    // ? Print task data back to the screen
    printTaskData();
  
    // ? Clear the form inputs
    taskNameInputEl.val('');
    taskDescInputEl.val('');
    taskDateInputEl.val('');
  }


// COMPLETED: Creates a task card from the information passed in `task` parameter and returns it.
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
  
    // ? Sets the card background color based on due date. Only apply the styles if the dueDate exists and the status is not done.
    if (task.dueDate && task.status !== 'done') {
      const now = dayjs();
      const taskDueDate = dayjs(task.dueDate, 'DD/MM/YYYY');
  
      // ? If the task is due today, make the card yellow. If it is overdue, make it red.
      if (now.isSame(taskDueDate, 'day')) {
        taskCard.addClass('bg-warning text-white');
      } else if (now.isAfter(taskDueDate)) {
        taskCard.addClass('bg-danger text-white');
        cardDeleteBtn.addClass('border-light');
      }
    }
  
    // ? Gather all the elements created above and append them to the correct elements.
    cardBody.append(cardDescription, cardDueDate, cardDeleteBtn);
    taskCard.append(cardHeader, cardBody);
  
    // ? Return the card so it can be appended to the correct lane.
    return taskCard;
  }


// COMPLETED: Renders the task list and makes cards draggable
function renderTaskList() {
    const taskList = readTasksFromStorage();

    // ? Empty existing task cards out of the lanes
    const todoList = $('#todo-cards');
    todoList.empty();
  
    const inProgressList = $('#in-progress-cards');
    inProgressList.empty();
  
    const doneList = $('#done-cards');
    doneList.empty();
  
    // ? Loop through tasks and create task cards for each status
    for (let task of taskList) {
      if (task.status === 'to-do') {
        todoList.append(createTaskCard(task));
      } else if (task.status === 'in-progress') {
        inProgressList.append(createTaskCard(task));
      } else if (task.status === 'done') {
        doneList.append(createTaskCard(task));
      }
    }
  
    // ? Use JQuery UI to make task cards draggable
    $('.draggable').draggable({
      opacity: 0.7,
      zIndex: 100,
      // ? This is the function that creates the clone of the card that is dragged. This is purely visual and does not affect the data.
      helper: function (e) {
        // ? Check if the target of the drag event is the card itself or a child element. If it is the card itself, clone it, otherwise find the parent card  that is draggable and clone that.
        const original = $(e.target).hasClass('ui-draggable')
          ? $(e.target)
          : $(e.target).closest('.ui-draggable');
        // ? Return the clone with the width set to the width of the original card. This is so the clone does not take up the entire width of the lane. This is to also fix a visual bug where the card shrinks as it's dragged to the right.
        return original.clone().css({
          width: original.outerWidth(),
        });
      },
    });
  }


// Todo: create a function to handle adding a new task
function handleAddTask(event){

}


// COMPLETED: Removes a task from local storage and prints the task data back to the page
function handleDeleteTask(event){
    event.preventDefault();
    const taskId = $(this).attr('data-task-id');
    const taskList = readTasksFromStorage();
  
    // ? Remove task from the array. There is a method called `filter()` for this that is better suited which we will go over in a later activity. For now, we will use a `forEach()` loop to remove the task.
    taskList.forEach((task) => {
      if (task.id === taskId) {
        taskList.splice(taskList.indexOf(task), 1);
      }
    });
  
    // ? We will use our helper function to save the tasks to localStorage
    saveTasksToStorage(taskList);
  
    // ? Here we use our other function to print tasks back to the screen
    printTaskData();
  }


// COMPLETED: This function is called when a card is dropped into a lane. It updates the status of the task and saves it to localStorage.
function handleDrop(event, ui) {
    // ? Read tasks from localStorage
    const taskList = readTasksFromStorage();
  
    // ? Get the task id from the event
    const taskId = ui.draggable[0].dataset.taskId;
  
    // ? Get the id of the lane that the card was dropped into
    const newStatus = event.target.id;
  
    for (let task of taskList) {
      // ? Find the task card by the `id` and update the task status.
      if (task.id === taskId) {
        task.status = newStatus;
      }
    }
    // ? Save the updated tasks array to localStorage (overwritting the previous one) and render the new task data to the screen.
    localStorage.setItem('tasks', JSON.stringify(taskList));
    printTaskData();
  }


// COMPLETED: When the document is ready, print the task data to the screen and make the lanes droppable. Also, initialize the date picker.
$(document).ready(function () {
    // ? Print task data to the screen on page load if there is any
    printTaskData();
  
    $('#taskDueDate').datepicker({
      changeMonth: true,
      changeYear: true,
    });
  
    // ? Make lanes droppable
    $('.lane').droppable({
      accept: '.draggable',
      drop: handleDrop,
    });
  });

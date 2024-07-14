// ? Grab references to the important DOM elements.
const timeDisplayEl = $('#time-display');
const projectDisplayEl = $('#project-display');
const projectFormEl = $('#project-form');
const projectNameInputEl = $('#project-name-input');
const projectTypeInputEl = $('#project-type-input');
const projectDateInputEl = $('#taskDueDate');

// ? Helper function that displays the time, this is called every second in the setInterval function below.
function displayTime() {
  const rightNow = dayjs().format('MMM DD, YYYY [at] hh:mm:ss a');
  timeDisplayEl.text(rightNow);
}

// ? Reads projects from local storage and returns array of project objects.
// ? If there are no projects in localStorage, it initializes an empty array ([]) and returns it.
function readProjectsFromStorage() {
  // ? Retrieve projects from localStorage and parse the JSON to an array.
  // ? We use `let` here because there is a chance that there are no projects in localStorage (which means the projects variable will be equal to `null`) and we will need it to be initialized to an empty array.
  let projects = JSON.parse(localStorage.getItem('projects'));

  // ? If no projects were retrieved from localStorage, assign projects to a new empty array to push to later.
  if (!projects) {
    projects = [];
  }

  // ? Return the projects array either empty or with data in it whichever it was determined to be by the logic right above.
  return projects;
}

// ? Accepts an array of projects, stringifys them, and saves them in localStorage.
function saveProjectsToStorage(projects) {
  localStorage.setItem('projects', JSON.stringify(projects));
}

// ? Add event listener to the form element, listen for a submit event, and call the `handleProjectFormSubmit` function.
projectFormEl.on('submit', handleProjectFormSubmit);

// ? Because the cards are dynamically added to the screen, we have to use jQuery event delegation to listen for clicks on the added cards delete button.
// ? We listen for a click on the parent element, and THEN check if the target of the click is the delete button. If it is, we call the `handleDeleteProject` function
projectDisplayEl.on('click', '.btn-delete-project', handleDeleteProject);

// ? Call the `displayTime` function once on page load and then every second after that.
displayTime();
setInterval(displayTime, 1000);
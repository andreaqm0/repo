const url = "https://jsonplaceholder.typicode.com/todos";
const options = {
  0: { keys: ["id"], status: "all" },
  1: { keys: ["id", "title"], status: "all" },
  2: { keys: ["id", "userId"], status: "all" },
  3: { keys: ["id", "title"], status: "uncompleted" },
  4: { keys: ["id", "userId"], status: "uncompleted" },
  5: { keys: ["id", "title"], status: "completed" },
  6: { keys: ["id", "userId"], status: "completed" },
};

// GLOBAL VARIABLES
const select = document.getElementById("opt");
const divTodos = document.getElementById("todos");
let opt;

// MAIN
async function main() {
  registerServiceWorker();
  
  const todos = await getTodos();
  showTodos(mapingData(todos, options[opt]));
  
  select.value = 0;
  select.addEventListener("change", async (e) => {
    opt = e.target.value;
    const todos = await getTodos();
    showTodos(mapingData(todos, options[opt]));
  });
}

// FUNCTIONS
async function getTodos() {
  const todos = await fetch(url);
  return await todos.json();
}

function showTodos(todos) {
  console.log(todos);
  divTodos.innerHTML = "";
  todos.forEach((todo) => {
    const p = document.createElement("p");
    p.textContent = JSON.stringify(todo);
    divTodos.appendChild(p);
  });
}

const mapingData = (data, opt = { keys: ["id"], status: "all" }) => {
  return data
    .filter((data) =>
      opt.status === "all"
        ? true
        : opt.status === "completed"
        ? data.completed
        : opt.status === "uncompleted"
        ? !data.completed
        : false
    )
    .map((data) => {
      const keys = opt.keys.map((key) => ({ [key]: data[key] }));
      return keys.reduce((acc, curr) => ({ ...acc, ...curr }), {});
    });
};

function registerServiceWorker() {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker
      .register("./service-worker.js")
      .then((register) => {
        console.log("Service Worker Registered with scope: ", register.scope);
      })
      .catch((err) => {
        console.log("Service Worker registration failed: ", err);
      });
  }
}

// LOAD
window.addEventListener("DOMContentLoaded", () => {
  main();
});

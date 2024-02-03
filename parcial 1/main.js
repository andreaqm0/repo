const prompt = require("prompt-sync")({ sigint: true });

const options = {
    1: {keys: ["id"], status: "all"},
    2: {keys: ["id", "title"], status: "all"},
    3: {keys: ["id", "userId"], status: "all"},
    4: {keys: ["id", "title"], status: "uncompleted"},
    5: {keys: ["id", "userId"], status: "uncompleted"},
    6: {keys: ["id", "title"], status: "completed"},
    7: {keys: ["id", "userId"], status: "completed"},
}

const opt = Number(prompt(`
¿Qué quieres hacer? \n
    1. Ver ID de todos los pendientes \n
    2. Ver ID y title de todos los pendientes \n
    3. Ver ID y userId de todos los pendientes \n
    4. Ver ID y title de todos los pendientes sin resolver \n
    5. Ver ID y userId de todos los pendientes sin resolver \n
    6. Ver ID y title de todos los pendientes resueltos \n
    7. Ver ID y userId de todos los pendientes resueltos \n
`)
);

const url = "http://jsonplaceholder.typicode.com/todos";
fetch(url)
  .then((response) => response.json())
  .then((data) => {
    if (options[opt]) {
      mapingData(data, options[opt]).forEach((data) => console.log(data));
    } else console.log("No existe la opcion");
  })
  .catch((error) => console.log(error));

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
    })
};

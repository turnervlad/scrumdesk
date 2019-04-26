const createNewColumn = name => `<div class="column-header">
				<text class="column-name">${name}</text>
				<a onclick="removeColumn(this)" class="remove-column" href="#"><i class="far fa-times-circle"></i></a>
			</div>
			<div class="tasks-list droppable">
				
			</div>
			<div class="add-new-task">
				<input type="text">
				<button onclick="addNewTask(this)" class="button-new-task"><i class="far fa-calendar-plus"></i>    Добавить новую задачу</button>
			</div>`;

const getNewTask = (name, date) =>
  `<div>
            <text class="task-name">${name}</text>
            <a onclick="removeTask(this)" href="#"><i class="fas fa-trash-alt"></i></a>
          </div>
          <text id="date" class="Date">${date}</text>`;

var container = document.getElementById("container");

var tasksList = document.getElementsByClassName("tasks-list");

let myStorage = window.localStorage;

function setItemToStore(storage) {
  console.log(storage.columns[0]);
  myStorage.setItem("domTree", JSON.stringify(storage));
}

//рисуется DOM дерево из объекта storage
const domTree = myStorage.getItem("domTree");

if (!domTree) {
  const initStore = {
    columns: [
      {
        name: "To Do",
        childs: [{ name: "Кушать паски", date: "08.08.14" }]
      },
      {
        name: "In Progress",
        childs: []
      },
      {
        name: "Ready For Testing",
        childs: []
      },
      {
        name: "Done",
        childs: []
      }
    ]
  };
  setItemToStore(initStore);
}

if (domTree) {
  let storage = getStore();

  for (let i = 0; i < storage.columns.length; i++) {
    let div = document.createElement("div");
    div.className = "columns";
    div.innerHTML = createNewColumn(storage.columns[i].name);
    container.insertBefore(
      div,
      container.children[container.children.length - 1]
    );
    for (let j = 0; j < storage.columns[i].childs.length; j++) {
      let diva = document.createElement("div");
      diva.className = "task draggable";
      diva.innerHTML = getNewTask(
        storage.columns[i].childs[j].name,
        storage.columns[i].childs[j].date
      );
      tasksList[i].appendChild(diva);
    }
  }
}

function getStore() {
  return JSON.parse(myStorage.getItem("domTree"));
}

const newStorageColumn = {
  name: "To Do",
  childs: []
};

function addNewColumn() {
  let storage = getStore();
  let div = document.createElement("div");
  div.className = "columns";
  var newColumnName = prompt("Введите имя для новой колонки", "Планы на год");
  div.innerHTML = createNewColumn(newColumnName);
  container.insertBefore(
    div,
    container.children[container.children.length - 1]
  );
  storage.columns.push(newStorageColumn);
  storage.columns[storage.columns.length - 1].name = newColumnName;

  setItemToStore(storage);
}

var columns = document.getElementsByClassName("columns");

function removeColumn(iam) {
  let storage = getStore();
  for (let i = 0; i < columns.length; i++) {
    if (iam.parentNode.parentNode == columns[i]) {
      storage.columns.splice(i, 1);
    }
  }
  setItemToStore(storage);
  iam.parentNode.parentNode.remove();
}

function removeTask(iam) {
  let storage = getStore();
  for (let i = 0; i < columns.length; i++) {
    if (iam.parentNode.parentNode.parentNode.parentNode == columns[i]) {
      let task = columns[i].getElementsByClassName("task");
      for (let j = 0; j < task.length; j++) {
        if (iam.parentNode.parentNode == task[j]) {
          storage.columns[i].childs.splice(j, 1);
          console.log(storage);
        }
      }
    }
  }
  setItemToStore(storage);
  iam.parentNode.parentNode.remove();
}

var now = new Date();
var year = now.getFullYear();
var month = "0" + (now.getMonth() + 1);
var day = now.getDate();
var taskDate = day + "." + month + "." + year;

function addNewTask(iam) {
  let storage = getStore();
  let taskName = iam.previousElementSibling.value;
  if (taskName.length < 1) {
    alert("Введите хотя бы один символ!");
    return;
  }

  for (let i = 0; i < columns.length; i++) {
    if (iam.parentNode.parentNode == columns[i]) {
      const newStorageTask = {
        name: taskName,
        date: day + "." + month + "." + year
      };
      storage.columns[i].childs.push(newStorageTask);
    }
  }

  setItemToStore(storage);

  const column = iam.parentNode.parentNode.querySelector(".tasks-list");
  let div = document.createElement("div");
  div.className = "task draggable";
  div.innerHTML = getNewTask(taskName, taskDate);
  column.appendChild(div);
  iam.previousElementSibling.value = "";
}

function hithlightAllowedCollumns(el) {
  const startColumn = el.closest(".columns");
  if (
    startColumn.previousElementSibling &&
    startColumn.previousElementSibling.className === "columns"
  ) {
    startColumn.previousElementSibling.className = "columns allowed";
  }

  if (
    startColumn.nextElementSibling &&
    startColumn.nextElementSibling.className === "columns"
  ) {
    startColumn.nextElementSibling.className = "columns allowed";
  }
}

function removeHighlihts() {
  const allowedComuns = document.querySelectorAll(".columns.allowed");
  for (let i = 0; i < allowedComuns.length; i++) {
    allowedComuns[i].className = "columns";
  }
}

var DragManager = (function() {
  /**
   * составной объект для хранения информации о переносе:
   * {
   *   elem - элемент, на котором была зажата мышь
   *   avatar - аватар
   *   downX/downY - координаты, на которых был mousedown
   *   shiftX/shiftY - относительный сдвиг курсора от угла элемента
   * }
   */
  var dragObject = {};

  var self = this;
  var oldStorageColumnPosition, oldStorageTaskPosition, elemName, elemDate;

  function onMouseDown(event) {
    if (event.which != 1) return;

    var elem = event.target.closest(".draggable");
    elemName = elem.getElementsByClassName("task-name");
    elemDate = elem.getElementsByClassName("Date");
    console.log(elemName[0].textContent, elemDate[0].textContent);

    for (let i = 0; i < columns.length; i++) {
      if (elem.parentNode.parentNode == columns[i]) {
        oldStorageColumnPosition = i;
        let task = columns[i].getElementsByClassName("task");
        for (let j = 0; j < task.length; j++) {
          if (elem == task[j]) {
            oldStorageTaskPosition = j;
          }
        }
      }
    }

    if (!elem) return;
    dragObject.elem = elem;
    // запомним, что элемент нажат на текущих координатах pageX/pageY
    dragObject.downX = event.pageX;
    dragObject.downY = event.pageY;

    return false;
  }

  function onMouseMove(event) {
    if (!dragObject.elem) return; // элемент не зажат

    if (!dragObject.avatar) {
      // если перенос не начат...
      var moveX = event.pageX - dragObject.downX;
      var moveY = event.pageY - dragObject.downY;

      // если мышь передвинулась в нажатом состоянии недостаточно далеко
      if (Math.abs(moveX) < 3 && Math.abs(moveY) < 3) {
        return;
      }
      hithlightAllowedCollumns(dragObject.elem);

      // начинаем перенос
      dragObject.avatar = createAvatar(event); // создать аватар
      if (!dragObject.avatar) {
        // отмена переноса, нельзя "захватить" за эту часть элемента
        dragObject = {};
        return;
      }

      // аватар создан успешно
      // создать вспомогательные свойства shiftX/shiftY
      var coords = getCoords(dragObject.avatar);
      dragObject.shiftX = dragObject.downX - coords.left;
      dragObject.avatar.style.width = coords.width + "px";
      dragObject.avatar.style.height = coords.height + "px";

      startDrag(event); // отобразить начало переноса
    }

    // отобразить перенос объекта при каждом движении мыши
    dragObject.avatar.style.left = event.pageX - dragObject.shiftX + "px";
    dragObject.avatar.style.top = event.pageY + 10 + "px";

    return false;
  }

  function onMouseUp(event) {
    if (dragObject.avatar) {
      // если перенос идет
      finishDrag(event);
      removeHighlihts();
    }

    // перенос либо не начинался, либо завершился
    // в любом случае очистим "состояние переноса" dragObject
    dragObject = {};
  }

  function finishDrag(event) {
    var dropElem = findDroppable(event);
    if (!dropElem) {
      self.onDragCancel(dragObject);
    } else {
      self.onDragEnd(dragObject, dropElem);
    }
  }

  function createAvatar(event) {
    var avatar = dragObject.elem;

    var old = {
      parent: avatar.parentNode,
      nextSibling: avatar.nextSibling,
      position: avatar.position || "",
      left: avatar.left || "",
      top: avatar.top || "",
      zIndex: avatar.zIndex || "",
      width: avatar.width || "",
      height: avatar.height || ""
    };

    // функция для отмены переноса
    avatar.rollback = function() {
      old.parent.insertBefore(avatar, old.nextSibling);
      avatar.removeDrugStyles();
    };

    avatar.removeDrugStyles = () => {
      avatar.style.height = old.height;
      avatar.style.width = old.width;
      avatar.style.position = old.position;
      avatar.style.left = old.left;
      avatar.style.top = old.top;
      avatar.style.zIndex = old.zIndex;
    };

    return avatar;
  }

  function startDrag(event) {
    var avatar = dragObject.avatar;

    // инициировать начало переноса
    document.body.appendChild(avatar);
    avatar.style.zIndex = 9999;
    avatar.style.position = "absolute";
    avatar.className = "task draggable";
  }

  function findDroppable(event) {
    // спрячем переносимый элемент
    dragObject.avatar.hidden = true;

    // получить самый вложенный элемент под курсором мыши
    var elem = document.elementFromPoint(event.clientX, event.clientY);

    // показать переносимый элемент обратно
    dragObject.avatar.hidden = false;

    if (elem == null) {
      // такое возможно, если курсор мыши "вылетел" за границу окна
      return null;
    }

    return elem.closest(".columns.allowed");
  }

  document.onmousemove = onMouseMove;
  document.onmouseup = onMouseUp;
  document.onmousedown = onMouseDown;

  this.onDragEnd = function(dragObject, dropElem) {
    let storage = getStore();
    const taskList = dropElem.querySelector(".tasks-list");
    dragObject.avatar.removeDrugStyles();
    taskList.appendChild(dragObject.avatar);
    console.log(oldStorageColumnPosition, oldStorageTaskPosition);
    storage.columns[oldStorageColumnPosition].childs.splice(
      oldStorageTaskPosition,
      1
    );

    let tasksList = document.getElementsByClassName("tasks-list");
    for (let i = 0; i < tasksList.length; i++) {
      if (taskList == tasksList[i]) {
        let dragStorageTask = {
          name: elemName[0].textContent,
          date: elemDate[0].textContent
        };
        storage.columns[i].childs.push(dragStorageTask);
      }
    }
    setItemToStore(storage);
  };

  this.onDragCancel = function(dragObject) {
    dragObject.avatar.rollback();
  };
})();

function getCoords(elem) {
  // кроме IE8-
  var box = elem.getBoundingClientRect();

  return {
    left: box.left + pageXOffset,
    width: box.width - 12,
    height: box.height - 12
  };
}

const createNewColumn = name => `<div class="column-header">
				<div class="column-name">
					${name}
				</div>
				<a onclick="removeColumn(this)" class="remove-column" href="#"><i class="far fa-times-circle"></i></a>
			</div>
			<div class="tasks-list droppable">
				<div class="task draggable">	
					<text>пожрать</text>
					<a onclick="removeTask(this)" href="#"><i class="fas fa-trash-alt"></i></a>
				</div>
			</div>
			<div class="add-new-task">
				<input type="text">
				<button onclick="addNewTask(this)" class="button-new-task"><i class="far fa-calendar-plus"></i>    Добавить новую задачу</button>
			</div>`;

const getNewTask = name =>
  `<text>${name}</text><a onclick="removeTask(this)" href="#"><i class="fas fa-trash-alt"></i></a>`;

var container = document.getElementById("container");

function addNewColumn() {
  let div = document.createElement("div");
  div.className = "columns";

  var newColumnName = prompt("Введите имя для новой колонки", "Планы на год");
  div.innerHTML = createNewColumn(newColumnName);

  container.insertBefore(
    div,
    container.children[container.children.length - 1]
  );
}

function removeColumn(iam) {
  iam.parentNode.parentNode.remove();
}

function removeTask(iam) {
  iam.parentNode.remove();
}

function addNewTask(iam) {
  const taskName = iam.previousElementSibling.value;
  if (taskName.length < 1) {
    alert("Собака сутулая, введи хоть один символ");
    return;
  }
  const column = iam.parentNode.parentNode.querySelector(".tasks-list");
  let div = document.createElement("div");

  div.className = "task draggable";
  div.innerHTML = getNewTask(taskName);
  column.appendChild(div);
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

  function onMouseDown(event) {
    if (event.which != 1) return;

    var elem = event.target.closest(".draggable");
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
      hithlightAllowedCollumns(dragObject.elem);
      // если перенос не начат...
      var moveX = event.pageX - dragObject.downX;
      var moveY = event.pageY - dragObject.downY;

      // если мышь передвинулась в нажатом состоянии недостаточно далеко
      if (Math.abs(moveX) < 3 && Math.abs(moveY) < 3) {
        return;
      }

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
    const taskList = dropElem.querySelector(".tasks-list");
    dragObject.avatar.removeDrugStyles();
    taskList.appendChild(dragObject.avatar);
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

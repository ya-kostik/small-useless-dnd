# Пример реализации DnD
С минимальным числом событий и хуками

Подойдет не для всех проектов, но чтобы разобраться
или собрать DnD по быстрому подойдет.

## Как это вообще работает
Drag and Drop, в принципе, состоит из таких частей:
1. Фаза захвата. Пользователь что-то потащил, что ему можно тащить
2. Фаза наведения. Когда пользователь водит объектом над контейнером,
готовым этот объект принять
3. Фаза выведения. Когда пользователь увел объект с контейнера,
готового этот объект принять.
4. Фаза броска. Когда объект отпустили над контейнером,
готовым этот объект принять.
5. Фаза завершения. Когда объект в принципе тащили и отпустили.

### Что в примере
В примере сделаны все пять фаз.
- Фаза захвата и завершения фиксируется демо кодом: `/demo/script.js`;
- Дальше управление передается в «библиотеку» `/DnD.js`;
- Регистрируются хуки для всех фаз кроме захвата и завершения,
потому что они по задумке фиксируются в начальных обработчиках, где все стартует.

Простым языком.
Мы вешаем на перетаскиваемые dom-объекты (draggable="true") два события:
- `dragstart` — чтобы запустить логику отслеживания наведения, выведения и броска;
- `dragend` — чтобы очистить все события и забыть.

Запускаем в соответствующих событиях отслеживание перетаскивания двумя функции из «библиотеки» `/DnD.js`:
- `dragStart(context, options)`;
- `dragEnd(contex)`.

Где `context` — это любой объект, с которым будут связано перетаскивание.
В примере используем dom-элемент, который начали тащить.
`options` — это объект опций, все опции можно посмотреть в конструкторе `/DnD.js`,
а нас интересуют только три:
- `isDropTarget` — функция, которая должна возвращать `true`,
если переданный в нее аргумент — это dom-элемент, в который можно сбросить, или `false` в противном случае;
- `hooks` — объект с хуками, о них ниже.

Можно зарегистрировать следующие хуки:
- `enter` — когда навели на dom-элемент в который можно сбросить объект;
- `over` — раз в некоторое время когда перетаскиваемый объект держат или двигают над dom-элементом в который можно сбросить объект;
- `leave` — сработает если покинули dom-элемент в который можно сбросить объект;
- `drop` — срабатывает, когда отпустили объект над dom-элементом в который можно сбросить.

Все хуки принимают следующие параметры:
- `evt` — событие побудившее хук;
- `element` — dom-элемент в который можно сбросить объект;
- `context` — контекст, на который завязали DnD в `dragStart`;
- `dnd` — объект процессинга `dnd`, скорее всего никогда не понадобится (но через него можно, например, привязать или удалить в процессе другие хуки).

Все остальные подробности работы демки можно разобрать в `/demo/script.js`. Он очень простой.

## «Библиотека» `/DnD.js`
Это небольшой класс и две функции для быстрого создания и очистки его объекта,
чтобы не делать это вручную (не создавать экземпляр, вешать хуи и отвязывать от контекста).

### `dragStart(context, options)`
Создает объект класса `DnD`, и записывает его в приватный символ внутри `context`.
Запускает перетаскивание — `dnd.start()`.

Запись в символьное поле нужна, чтобы потом в вызывая `dragEnd` с темже контекстом,
можно было найти этот экземпляр, завершить перетаскивание, отвязать все хуки,
и спокойно с ним попрощаться.

### `dragEnd(context)`
Находит в контексте `dnd` объект и завершает перетаскивание — `dnd.end()`.

### Небольшое замечание про `context`
Контекстом, в принципе, может быть любой объект.
Для демо я использовал то что было — dom-элемент, который начали тащить.
Так как его однозначно можно получить внутри событий `dragstart` и `dragend`.

Если писать на `Vue` или `React`, то может быть опасно полагаться на dom-элемент, он может поменяться.
Поэтому можно передать, например, объект компонента или какой-то другой
связанный с компонентом контекст.

Главное чтобы объект не был заморожен,
чтобы в него можно было добавить символьное поле.

### Класс `DnD`

#### Конструктор
Принимает два парамета: `context` и `options`.
Про контекст говорили выше, а опции могут быть следующие:
- `isDropTarget` — функция, которая должна возвращать `true`,
если переданный в нее аргумент — это dom-элемент,
в который можно сбросить, или `false` в противном случае.
Использутся чтобы найти подходящий контейнер, готовый принять перетаскиваемый объект;
- `stop` и `prevent` — флаги, если `true` то события не будут вслпывать и выполнять действия по умолчанию, соответственно;
- `hooks` — объект с хуками, чтобы отслеживать фазы перетаскивания.

#### Хуки
Хуки — это функции, по сути очень похожие на события.
`DnD` поддерживает шесть хуков:
- `start` — когда вызывали `dnd.start()`, по сути начало перетаскивания,
когда все обработчики добавлены и можно все отслеживать.
Скорее всего не понадобится;
- `enter` — когда навели на dom-элемент в который можно сбросить объект;
- `over` — раз в некоторое время когда перетаскиваемый объект держат или двигают над dom-элементом в который можно сбросить объект;
- `leave` — сработает если покинули dom-элемент в который можно сбросить объект;
- `drop` — срабатывает, когда отпустили объект над dom-элементом в который можно сбросить.
- `end` — когда вызывали `dnd.end()`, по сути конец перетаскивания,
когда все данные очищены, а обработчики сняты.
Скорее всего не понадобится;

Чтобы добавить хуки есть три способа:
1. Объект `hooks` в опциях конструктора: `new DnD(context, { hooks: hooks })`.
Ключи в объекте `hooks` — это имена нужных хуков, а значения — это функции-обработчики.
2. Вызвать метод `dnd.hook(name, fn)`. Где `name` — это строковое имя хука, а `fn` — это функция-обработчик.
3. Вызвать метод `dnd.hooks(hooks)`. Где `hooks` — это объект, аналогичный объекту из опций конструктора.

Все функции обработчики в хуках, кроме `start` и `end` принимают четыре параметра:
- `evt` — событие побудившее хук;
- `element` — dom-элемент в который можно сбросить объект;
- `context` — контекст, на который завязали DnD в `dragStart` или конструкторе;
- `dnd` — объект процессинга `dnd`,
скорее всего никогда не понадобится
(но через него можно, например, привязать или удалить в процессе другие хуки).

`start` и `end` принимают только `context` и `dnd`.

#### `Метод start()`
«Запустить в работу»:
1. Добавить на `window` обработчик `dnd.onWindowDragEnter`.
2. Выполнить хуки `start`.

#### Обработчик `onWindowDragEnter`
Обрабатывает `dragenter` на любой dom-элемент внутри window.
Кажется, что это жестоко, но на самом деле,
такой подход не тормозит (разве что у вас **очень-очень-очень** глубокое дерево).

Когда событие срабатывает, поднимается от `evt.target` (включительно)
наверх по родительским элементам,
в поисках подходящего dom-элемента, готового принять перетаскиваемый объект.

«Готовность принять» проверяется как раз функцией `isDropTarget`,
которую нужно передать в опциях конструктора.

Дальше поведение будет меняться:
##### 1. Нашли подходящий контейнер, до этого такого элемента не было
1. Запоминаем этот dom-элемент для будущих проверок и хуков.
2. Вешаем на него обработчики `onElementDragOver` и `onElementDrop`.
3. Запускаем хуки `enter`.

##### 2. Нашли подходящий контейнер, и это тотже контейнер, что нашли в прошлый раз
Такое может быть, если внутри контейнера, если другие элементы.
Например «красивая svg иконка».

Тогда просто игнорируем, и ничего не делаем.

##### 3. Нашли подходящий контейнер, и это другой контейнер, не ранее найденный
Такое может быть если:
- несколько контейнеров, готовых принять перетаскиваемый объект стоят рядом,
и объект перетащили с одного на дргой;
- внутри контейнера есть другой контейнер.

1. С ранее найденного контейнера снимаем обработчики `onElementDragOver` и `onElementDrop`.
2. Запускаем хуки `leave` для ранее найденного контейнера.
3. Запоминаем новый dom-элемент контейнера для будущих проверок и хуков.
4. Вешаем на него обработчики `onElementDragOver` и `onElementDrop`.
5. Запускаем хуки `enter`.

##### 4. Не нашли подходящий контейнер, и не находили до этого
Просто игнорируем, и ничего не делаем.

##### 5. Не нашли подходящий контейнер, но находили до этого
Это значит, что мы покинули контейнер, готовый принять объект.

1. С ранее найденного контейнера снимаем обработчики `onElementDragOver` и `onElementDrop`.
2. Запускаем хуки `leave` для ранее найденного контейнера.
3. Забываем прошлый контейнер.

#### Обработчик `onElementDragOver`
Запускаем хуки `over`.

#### Обработчик `onElementDrop`
Запускаем хуки `drop`.

#### `Метод end()`
«Завершить работу»:
1. Если есть найденный dom-элемент готовый принять перетаскиваемый объект,
то снять с него все события и выполнить хуки `leave`.
2. Снять с `window` обработчик `dnd.onWindowDragEnter`.
3. Выполнить хуки `end`.

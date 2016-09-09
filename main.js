/* eslint-env browser */
/* global autosize */
(function (document, window) {
  var root = document.querySelector('main');
  var textarea = document.querySelector('textarea');

  var make = tag => document.createElement(tag);
  var add = (what, to) => to.appendChild(what);
  var on = (el, event, callback) => el.addEventListener(event, callback);

  try { // to restore from local storage
    var old = localStorage.getItem('write');
    if (old) {
      textarea.value = old;
    }
  } catch (e) {}

  on(root, 'keydown', toggleFullScreen);
  on(root, 'click', function () {
    editor.focus();
  });

  function toggleFullScreen(event) {
    var className = 'fullscreen';
    if (event.which === 13 && event.metaKey) {
      if (!isFull().fullscreenElement) {
        launchIntoFullscreen(this);
        root.classList.add(className);
      } else {
        root.classList.remove(className);
        exitFullscreen();
      }

      setTimeout(() => editor.update(), 200);
    }
  }

  function isFull() {
    var fullscreenElement = document.fullscreenElement || document.mozFullScreenElement || document.webkitFullscreenElement;
    var fullscreenEnabled = document.fullscreenEnabled || document.mozFullScreenEnabled || document.webkitFullscreenEnabled;
    return {
      fullscreenElement: fullscreenElement,
      fullscreenEnabled: fullscreenEnabled,
    };
  }

  function launchIntoFullscreen(element) {
    if (element.requestFullscreen) {
      element.requestFullscreen();
    } else if (element.mozRequestFullScreen) {
      element.mozRequestFullScreen();
    } else if (element.webkitRequestFullscreen) {
      element.webkitRequestFullscreen();
    } else if (element.msRequestFullscreen) {
      element.msRequestFullscreen();
    }
  }

  // Whack fullscreen
  function exitFullscreen() {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.mozCancelFullScreen) {
      document.mozCancelFullScreen();
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
    }
  }

  function save() {
    const saveData = (function () {
      const a = make('a');
      document.body.appendChild(a);
      a.style = 'display: none';
      return function (data, fileName) {
        var blob = new Blob([data], {
            type: 'octet/stream'
          }),
          url = window.URL.createObjectURL(blob);
        a.href = url;
        a.download = fileName;
        a.click();
        window.URL.revokeObjectURL(url);
      };
    }());

    const data = editor.getValue();
    const lines = data.split('\n').filter(_ => _.trim()).filter(Boolean);
    const h1 = lines.filter(_ => _.indexOf('# ') === 0).shift();
    var slug = 'untitled';

    if (h1) {
      slug = slugify(h1);
    } else if (lines[0]) {
      slug = slugify(lines[0]);
    }

    saveData(data, slug + '.md');
  };

  function slugify(s) {
    return (s || '')
      .trim()
      .toLowerCase()
      .replace(/[\s-]+/g, '-')
      .replace(/[^a-z0-9-]/g, '')
      .replace(/^-+|-+$/g, '')
      .replace(/[\s-]+/g, '-');
  }

  function Editor(source) {
    this.events = {};
    this.source = source;
    source.classList.add('write');
    var container = this.container = make('div');
    container.classList.add('write');
    var target = this.target = make('pre');
    target.classList.add('write');

    add(target, container);
    add(source, container);
    add(this.container, document.querySelector('main'));
    on(source, 'input', () => this.update());

    this.update();
    setTimeout(() => autosize(source), 10); // DOM tick
  }

  Editor.prototype.commands = {};

  Editor.prototype.update = function () {
    var html = Prism.highlight(textarea.value, Prism.languages.markdown);
    this.target.innerHTML = html;
    this.emit('change', html);
  };

  Editor.prototype.getValue = function () {
    return this.source.value;
  };

  Editor.prototype.setValue = function (v) {
    this.source.value = v;
    autosize.update(textarea);
    this.update();
  };

  Editor.prototype.on = function (event, callback) {
    if (!this.events[event]) {
      this.events[event] = [];
    }

    this.events[event].push(callback);
  };

  Editor.prototype.emit = function (event, ...args) {
    for (const handler of (this.events[event] || [])) {
      handler.apply(this, args);
    }
  };

  Editor.prototype.focus = function () {
    this.source.focus();
  };

  var editor = new Editor(textarea);

  editor.on('change', () => {
    localStorage.setItem('write', editor.getValue());
  });

  editor.commands.save = save;
  editor.commands.new = function () {
    editor.setValue('');
  };

  editor.focus();

  document.querySelector('#show-actions').onclick = () => {
    document.querySelector('main').classList.toggle('show-actions');
  };

  const actions = document.querySelector('#actions');
  actions.addEventListener('click', function (event) {
    const node = event.target;
    if (node.nodeName === 'BUTTON') {
      event.preventDefault();
      event.stopPropagation();
      if (editor.commands[node.dataset.action]) {
        editor.commands[node.dataset.action]();
      }
    }
  }, false);

  // resets the jump position
  setTimeout(() => {
    var ePos = 0;
    var sPos = 0;
    if (textarea.setSelectionRange) {
      textarea.setSelectionRange(sPos, ePos);
    } else if (textarea.createTextRange) {
      var range = textarea.createTextRange();
      range.collapse(true);
      if (sPos < 0) {
        sPos = textarea.value.length + sPos;
      }
      range.moveEnd('character', ePos);
      range.moveStart('character', sPos);
      range.select();
    }
    document.body.scrollTop = 0;
  }, 10);
})(document, window);
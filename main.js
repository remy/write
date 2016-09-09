/* eslint-env browser */
/* global CodeMirror, autosize, testForMobile */
var root = document.documentElement;
var mobileT = null; // mobile textarea
var isMobile = testForMobile();
var textarea = document.querySelector('#codemirror');

try { // to restore from local storage
  const old = localStorage.getItem('write');
  if (old) {
    textarea.value = old;
  }
} catch (e) {}

root.addEventListener('keydown', toggleFullScreen);
root.addEventListener('click', function () {
  editor.focus();
  if (mobileT) {
    mobileT.focus();
  }
});

window.onresize = () => {
  editor.refresh();
}

function toggleFullScreen(event) {
  if (event.which === 13 && event.metaKey) {
    if (!isFull().fullscreenElement) {
      launchIntoFullscreen(this);
      root.classList.add('fullscreen');
    } else {
      root.classList.remove('fullscreen');
      exitFullscreen();
    }

    setTimeout(() => editor.refresh(), 200);
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

CodeMirror.commands.save = function () {
  const saveData = (function () {
    const a = document.createElement('a');
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

var editor = CodeMirror.fromTextArea(textarea, {
  mode: 'gfm',
  lineWrapping: true,
  autoCloseBrackets: true,
  readOnly: isMobile ? 'nocursor' : false,
  extraKeys: {
    'Enter': 'newlineAndIndentContinueMarkdownList'
  }
});

editor.on('change', () => {
  localStorage.setItem('write', editor.getValue());
});

editor.focus();

// if we're mobile, we do a bit of magic here: we create a new textarea
// on top of the codemirror instance, and make the text invisible, so it
// looks like code mirror works on mobile (when really it doesn't).
if (isMobile) {
  const t = document.createElement('textarea');
  t.setAttribute('autocorrect', 'off');
  t.setAttribute('autocapitalize', 'off');
  t.setAttribute('spellcheck', 'false');
  t.setAttribute('contenteditable', 'false');
  document.body.appendChild(t);
  document.body.classList.add('mobile');
  t.classList.add('CodeMirror');
  t.value = editor.getValue();
  autosize(t);

  mobileT = t;

  t.oninput = () => {
    editor.setValue(t.value);
  };

//   var time = 0;
//   t.addEventListener('touchstart', () => {
//     time = Date.now();
//     console.log('start')
//   });
//   t.addEventListener('touchend', () => {

//     console.log('end %s', Date.now() - time)
//     if (Date.now() - time > 500) {
//       console.log('save!');
//     }
//   });
}

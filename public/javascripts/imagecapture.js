navigator.getMedia = navigator.webkitGetUserMedia || navigator.getUserMedia;
window.URL = window.URL || window.webkitURL;

var frames = new Array();

// var app = document.getElementById('app');
var video = document.getElementById('monitor');
var canvas = document.getElementById('photo');
// var effect = document.getElementById('effect');
// var gallery = document.getElementById('gallery');
var ctx = canvas.getContext('2d');
// var intervalId = null;
var idx = 0;
// var filters = [
//   'grayscale',
//   'sepia',
//   'blur',
//   'brightness',
//   'contrast',
//   'hue-rotate', 'hue-rotate2', 'hue-rotate3',
//   'saturate',
//   'invert',
//   ''
// ];

// function changeFilter(el) {
//   el.className = '';
//   var effect = filters[idx++ % filters.length];
//   if (effect) {
//     el.classList.add(effect);
//   }
// }

function gotStream(stream) {
  if (window.URL) {
    video.src = window.URL.createObjectURL(stream);
  } else {
    video.src = stream; // Opera.
  }

  video.onerror = function(e) {
    stream.stop();
  };

  stream.onended = noStream;

  video.onloadedmetadata = function(e) { // Not firing in Chrome. See crbug.com/110938.
  };

  // Since video.onloadedmetadata isn't firing for getUserMedia video, we have
  // to fake it.
  setTimeout(function() {
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
  }, 100);
}

function noStream(e) {
  var msg = 'No camera available.';
  if (e.code == 1) {
    msg = 'User denied access to use camera.';
  }
  document.getElementById('errorMessage').textContent = msg;
}

function capture() {
    ctx.drawImage(video, 0, 0);
    var img = document.createElement('img');
    var buffer = canvas.toDataURL('image/webp').replace("data:image/webp;base64,", "");

    $.ajax({
        url: "http://localhost:3000/upload",
        type: 'post',
        dataType: 'json',
        data: {bufferedImage : buffer},
        success: createThumbnail
    });
}

function toggleSelect(e) {
    var img = document.getElementById(e.target.id);
    // console.log(img);
    if ($(img).hasClass('selected'))
    {
        $(img).removeClass('selected');
        frames.remove(img.id);
        // console.log(frames);
    }
    else
    {
        $(img).addClass('selected');
        frames.push(img.id);
        // console.log(frames);
    }
}

function selectAll() {
  $.each($("#gallery img"), function() {
    if (!$(this).hasClass('selected')) {
      $(this).addClass('selected');
    }
    frames.push($(this).attr('id'));
  });
  console.log(frames);
}

function selectNone() {
  $.each($("#gallery img"), function() {
    if ($(this).hasClass('selected')) {
      $(this).removeClass('selected');
    }
    frames.remove($(this).attr('id'));
  });
  console.log(frames);
}

function createThumbnail(data)
{
    var img = document.createElement('img');
    img.src = '../uploads/' + data.thumbnail;
    img.id  = data.thumbnail;
    img.addEventListener("click", toggleSelect, false);
    gallery.insertBefore(img, gallery.firstChild);
    if ($(gallery).height() >= $('#gallery-container').height()) {
      $("#gallery-container").slimScroll({
        height: $('#gallery-container').height()
      });
    }
}

function processGif(data) {
  $('#progressbar').hide();
  $('.progress-bar').css('width', '5%');
    $.each($("#stageArea img"), function() {
      $(this).remove();
    });

    $('#stageArea').append('<img src="../gifs/' + data.gif + '" />' );
    $('#stageModal').modal('show');
}

function generate() {
  if (frames.length <= 0) {
    console.log("no frames to generate gif from.");
    return;
  }
  else {
    $('#progressbar').show();
    $.ajax({
        url: "http://localhost:3000/gif",
        type: 'post',
        dataType: 'json',
        data: {frameBuffer : frames},
        success: processGif
    });
  }
}

function init() {
  if (!navigator.getMedia) {
    document.getElementById('errorMessage').innerHTML = 'Sorry. <code>navigator.getUserMedia()</code> is not available.';
    return;
  }
  el = document.getElementById('captureButton');
  el.onclick = capture;
  el.textContent = 'Take snapshot';
  navigator.getMedia({video: true}, gotStream, noStream);
}

var socket = io.connect(window.location.hostname);

socket.on('progress-action', function(data) {
  console.log(data);
  //update progress bar -- data.progress
  $('.progress-bar').css('width', data.progress + '%');

})

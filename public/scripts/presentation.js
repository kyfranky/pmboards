var TempStore;
var pageNum = 1;

var pdfDoc,
  pageRendering,
  pageNumPending,
  scale,
  canvas,
  ctx;

PDFJS.disableStream = true;
// The workerSrc property shall be specified.
PDFJS.workerSrc = 'scripts/pdf.worker.js';

socket.on('updateDocs', function (data) {

  console.log(data);

  app.service('uploads').get(data.Documents)
    .then(result => {
      const downloadUrl = result.uri;

      console.log('Stored blob with id', result.id);

      showing(downloadUrl, data.Page);
    }).catch(err => {
    console.error(err);
  });

});

socket.on('updatePage', function (data) {

  console.log(data);

  pageNum = data.Page;
  queueRenderPage(pageNum);

});

function getData(data) {

  const docId = data.getAttribute("data-documentId");

  socket.emit('updateDocs', {documentId: docId});

  app.service('uploads').get(docId)
    .then(result => {
      const downloadUrl = result.uri;
      showing(downloadUrl, 1)
    })

}


function renderPage(num) {
  pageRendering = true;
  // Using promise to fetch the page
  pdfDoc.getPage(num).then(function (page) {

    var container = document.getElementById('the-container');

    var viewport = page.getViewport(1);

    if (viewport.width > viewport.height) {
      var scale = (window.innerWidth * 80 / 100) / viewport.width;
    } else if (viewport.width < viewport.height) {
      console.log("ia", (window.innerHeight * 95 / 100) / viewport.height)
      var scale = (window.innerHeight * 95 / 100) / viewport.height;
    } else {
      var scale = 1;
    }

    viewport = page.getViewport(scale);
    canvas.height = viewport.height;
    canvas.width = viewport.width;

    // Render PDF page into canvas context
    var renderContext = {
      canvasContext: ctx,
      viewport: viewport
    };
    var renderTask = page.render(renderContext);

    // Wait for rendering to finish
    renderTask.promise.then(function () {
      pageRendering = false;
      if (pageNumPending !== null) {
        // New page rendering is pending
        renderPage(pageNumPending);
        pageNumPending = null;
      }
    });
  });


  // Update page counters
  document.getElementById('page_num').textContent = pageNum;
}

function queueRenderPage(num) {
  if (pageRendering) {
    pageNumPending = num;
  } else {
    renderPage(num);
  }
}

function onPrevPage() {
  if (pageNum <= 1) {
    return;
  }
  pageNum--;
  queueRenderPage(pageNum);
}
document.getElementById('prev').addEventListener('click', onPrevPage);

/**
 * Displays next page.
 */
function onNextPage() {
  if (pageNum >= pdfDoc.numPages) {
    return;
  }
  pageNum++;
  queueRenderPage(pageNum);
}
document.getElementById('next').addEventListener('click', onNextPage);

$(window).keydown(function (e) {

  var key = e.which;

  if (key == 13 || key == 39) {

    if (app.get('owner') === false) {
      return false
    }

    if (pageNum >= pdfDoc.numPages) {
      return false;
    }
    else {
      socket.emit('updatePage', {page: pageNum + 1});
      onNextPage();
    }

    return false;

  }

  else if (key == 37) { // left arrow

    if (app.get('owner') === false) {
      return false
    }

    if (pageNum <= 1) {
      return false;
    }
    else {
      socket.emit('updatePage', {page: pageNum - 1});
      onPrevPage();
    }

    return false;
  }
});

window.addEventListener('resize', drawStuff, false);

function showing(data, page) {

  if (TempStore != data) {
    reset();
    pageNum = page;
  }

  pdfDoc = null;
  pageRendering = false;
  pageNumPending = null;
  scale = 1.2;
  canvas = document.getElementById('the-canvas');
  ctx = canvas.getContext('2d');

  // If absolute URL from the remote server is provided, configure the CORS
  // header on that server.
  var url = data
  TempStore = data;

  /**
   * Asynchronously downloads PDF.
   */
  PDFJS.getDocument(url).then(function (pdfDoc_) {
    pdfDoc = pdfDoc_;
    document.getElementById('page_count').textContent = pdfDoc.numPages;

    // Initial/first page rendering
    renderPage(pageNum);
  });

}

function drawStuff() {
  if (TempStore) {
    renderPage(pageNum);
  }
}

function reset() {

  var oldcanv = document.getElementById('the-canvas');
  document.getElementById('the-container').removeChild(oldcanv);

  var canv = document.createElement('canvas');
  canv.id = 'the-canvas';
  document.getElementById('the-container').appendChild(canv);

}

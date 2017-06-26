function getQueryVariable(variable) {

  let query = window.location.search.substring(1);

  let vars = query.split("&");

  if (!query) {
    window.location.href = '/lobby.html';
  }
  if (!vars) {
    window.location.href = '/lobby.html';
  }
  else {
    for (let i = 0; i < vars.length; i++) {
      let pair = vars[i].split("=");
      if (pair[0] == variable) {
        if (pair[1]) {
          return pair[1];
        }
        else {
          window.location.href = '/lobby.html';
        }
      }
      else {
        window.location.href = '/lobby.html';
      }
    }
  }
  window.location.href = '/lobby.html';

}

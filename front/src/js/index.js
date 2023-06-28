import Mutoh from './views/Mutoh.js';
import Impala from './views/Impala.js';
import Xeikon from './views/Xeikon.js';
import Latex from './views/Latex.js';

export const navigateTo = (url) => {
  history.pushState(null, null, url);
  router();
};

const router = async () => {
  const routes = [
    { path: '/mutoh', view: Mutoh },
    { path: '/impala', view: Impala },
    { path: '/xeikon', view: Xeikon },
    { path: '/latex', view: Latex },
  ];

  const potentialMatches = routes.map((route) => {
    return {
      route: route,
      isMatch: location.pathname === route.path,
    };
  });

  let match = potentialMatches.find((potentialMatch) => potentialMatch.isMatch);

  if (!match) {
    match = {
      route: routes[0],
      isMatch: true,
    };
  }

  const view = new match.route.view();
  let href = match.route.path;
  let striped_href = `${href.replace('/', '').capitalize()}-nav`;
  selectLink(striped_href);
  setSessionStorage();
  await view.getData();
};

window.addEventListener('popstate', router);

document.addEventListener('DOMContentLoaded', () => {
  document.body.addEventListener('click', (e) => {
    if (e.target.matches('[data-link]')) {
      e.preventDefault();
      selectLink(e.target.id);
      navigateTo(e.target.href);
    }
  });
  router();
});

// set active navbar after click
function selectLink(href) {
  if (document.querySelector('.active-href')) {
    document.querySelector('.active-href').classList.remove('active-href');
  }
  document.querySelector(`#${href}`).classList.add('active-href');
}

//set sessionStorage for chart everytime href click
function setSessionStorage() {
  sessionStorage.removeItem('activeChartData');
  sessionStorage.removeItem('activeUnit');
}

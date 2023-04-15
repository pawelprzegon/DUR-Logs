import Dashboard from "./views/Dashboard.js";
import Mutoh from "./views/Mutoh.js";
import Impala from "./views/Impala.js";

export const navigateTo = url =>{
    history.pushState(null, null, url);
    router();
}

const router = async () => {
    const routes = [
        {path: '/', view: Dashboard },
        {path: '/mutoh', view: Mutoh },
        {path: '/impala', view: Impala },
    ];

    const potentialMatches = routes.map(route => {
        return{
            route: route,
            isMatch: location.pathname === route.path
        };
    });

    let match = potentialMatches.find(potentialMatch => potentialMatch.isMatch)

    if(!match){
        match = {
            route: routes[0],
            isMatch: true
        };
    }


    
    const view = new match.route.view();
    await view.getData();

    
};

window.addEventListener('popstate', router)

document.addEventListener('DOMContentLoaded', () => {
    document.body.addEventListener('click', e => {
        if (e.target.matches('[data-link]')){
            e.preventDefault();
            selectLink(e);
            navigateTo(e.target.href);
        }
    })
    
    router();
});

function selectLink(e){
    if(document.querySelector('.active-href')){
        document.querySelector('.active-href').classList.remove('active-href');
    }
    document.querySelector(`#${e.target.id}`).classList.add('active-href');
}

import {select, templates, classNames} from '../settings.js';
import {utils} from '../utils.js';


class Home{
  constructor(element){
    const thisHome = this;

    thisHome.render(element);
    thisHome.initWidgets();
  }
  render(element){
    const thisHome = this;

    const generatedHTML = templates.homePage();

    thisHome.dom = {};
    thisHome.dom.wrapper = element;

    thisHome.dom.wrapper.innerHTML = utils.createDOMFromHTML(generatedHTML).innerHTML;

    thisHome.dom.header = document.querySelector(select.home.header);
    thisHome.dom.carousel = document.querySelector(select.home.carousel);
    thisHome.dom.gallery = document.querySelector(select.home.gallery);

  }
  initWidgets(){
    const thisHome = this;
    // eslint-disable-next-line no-undef
    new Flickity(thisHome.dom.carousel, {
      wrapAround: true,
      autoPlay: true,
      setGallerySize: false,
      prevNextButtons: false,
    });

    thisHome.homeLinks = document.querySelectorAll(select.nav.homeLinks);
    thisHome.pages = document.querySelector(select.containerOf.pages).children;

    const idFromHash = window.location.hash.replace('#/', '');

    let pageMatchingHash = thisHome.pages[0].id;

    for (let page of thisHome.pages){
      if (page.id == idFromHash){
        pageMatchingHash = page.id;
        break;
      }
    }

    thisHome.activatePages(pageMatchingHash);

    for (let link of thisHome.homeLinks){
      link.addEventListener('click', function(event){
        const clickedElement = this;
        event.preventDefault();

        const id = clickedElement.getAttribute('href').replace('#', '');

        thisHome.activatePages(id);

        window.location.hash = '#/' + id;
      });
    }
  }
  activatePages(pageId){
    const thisHome = this;

    for(let page of thisHome.pages){
      page.classList.toggle(classNames.pages.active, page.id == pageId);
    }

    thisHome.navLinks = document.querySelectorAll(select.nav.links);

    for(let link of thisHome.navLinks){
      link.classList.toggle(
        classNames.nav.active, 
        link.getAttribute('href') == '#' + pageId
      );
    }
  }

}

export default Home;
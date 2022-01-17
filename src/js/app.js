import {settings, select, classNames} from './settings.js';
import Product from './Components/Product.js';
import Cart from './Components/Cart.js';
import Booking from './Components/Booking.js';
import Home from './Components/Home.js';

const app = {
  initPages: function(){
    const thisApp = this;

    thisApp.pages = document.querySelector(select.containerOf.pages).children;
    thisApp.navLinks = document.querySelectorAll(select.nav.links);

    // thisApp.homeLinks = document.querySelectorAll(select.nav.homeLinks);

    // console.log(thisApp.homeLinks);

    // for (let link of thisApp.homeLinks){
    //   thisApp.navLinks.push(link);
    // }

    // console.log(thisApp.navLinks);

    const idFromHash = window.location.hash.replace('#/', '');

    let pageMatchingHash = thisApp.pages[0].id;

    for (let page of thisApp.pages){
      if (page.id == idFromHash){
        pageMatchingHash = page.id;
        break;
      }
    }

    thisApp.activatePages(pageMatchingHash);

    for (let link of thisApp.navLinks){
      link.addEventListener('click', function(event){
        const clickedElement = this;
        event.preventDefault();

        const id = clickedElement.getAttribute('href').replace('#', '');

        thisApp.activatePages(id);

        window.location.hash = '#/' + id;
        console.log('click');
      });
    }
  },
  activatePages: function(pageId){
    const thisApp = this;

    for(let page of thisApp.pages){
      page.classList.toggle(classNames.pages.active, page.id == pageId);
    }

    for(let link of thisApp.navLinks){
      link.classList.toggle(
        classNames.nav.active, 
        link.getAttribute('href') == '#' + pageId
      );
    }
  },
  initMenu: function(){
    const thisApp = this;

    for(let productData in thisApp.data.products){
      new Product(thisApp.data.products[productData].id, thisApp.data.products[productData]);
    }
  },
  
  initData: function(){
    const thisApp = this;

    thisApp.data = {};
    const url = settings.db.url + '/' + settings.db.products;

    fetch(url)
      .then(function(rawResponse){
        return rawResponse.json();
      })
      .then(function(parsedResponse){

        thisApp.data.products = parsedResponse;

        thisApp.initMenu();
      });
  },

  initCart: function(){
    const thisApp = this;
    const cartElem = document.querySelector(select.containerOf.cart);
    thisApp.cart = new Cart(cartElem);

    thisApp.productList = document.querySelector(select.containerOf.menu);
    
    thisApp.productList.addEventListener('add-to-cart', function(event){
      app.cart.add(event.detail.product); 
    });

  },

  initBooking: function(){
    const thisApp = this;

    thisApp.bookingWidgetContainer = document.querySelector(select.containerOf.booking);

    new Booking(thisApp.bookingWidgetContainer);
    
  },

  initHome: function(){
    const thisApp = this;

    thisApp.homeContainer = document.querySelector(select.containerOf.homePage);
    
    new Home(thisApp.homeContainer);

  },

  init: function(){
    const thisApp = this;
    
    thisApp.initPages();
    thisApp.initHome();
    thisApp.initData();
    thisApp.initCart();
    thisApp.initBooking();
  },
};

app.init();


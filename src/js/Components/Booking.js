import {select, templates} from '../settings.js';
import {utils} from '../utils.js';
import AmountWidget from './AmountWidget.js';


class Booking{
  constructor(element){
    const thisBooking = this;

    thisBooking.render(element);
    thisBooking.initWidgets();
  }
  render(element){
    const thisBooking = this;
    
    const generatedHTML = templates.bookingWidget();

    thisBooking.dom = {};
    thisBooking.dom.wrapper = element;

    thisBooking.dom.wrapper.innerHTML = utils.createDOMFromHTML(generatedHTML).innerHTML;

    thisBooking.dom.peopleAmount = document.querySelector(select.booking.peopleAmount);
    thisBooking.dom.hoursAmount = document.querySelector(select.booking.hoursAmount);
  }
  initWidgets(){
    const thisBooking = this;

    thisBooking.peopleAmountWidget = new AmountWidget(thisBooking.dom.peopleAmount, thisBooking.peopleAmount);

    thisBooking.dom.peopleAmount.addEventListener('click', function(){

    });

    thisBooking.hoursAmountWidget = new AmountWidget(thisBooking.dom.hoursAmount, thisBooking.hoursAmount);

    thisBooking.dom.hoursAmount.addEventListener('click', function(){

    });
  }
}
export default Booking;
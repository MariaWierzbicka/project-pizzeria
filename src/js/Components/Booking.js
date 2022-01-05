import {select, templates} from '../settings.js';
import {utils} from '../utils.js';
import AmountWidget from './AmountWidget.js';
import DatePicker from './DatePicker.js';
import HourPicker from './HourPicker.js';


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
    thisBooking.dom.datePicker = document.querySelector(select.widgets.datePicker.wrapper);
    thisBooking.dom.hourPicker = document.querySelector(select.widgets.hourPicker.wrapper);

  }
  initWidgets(){
    const thisBooking = this;

    thisBooking.peopleAmountWidget = new AmountWidget(thisBooking.dom.peopleAmount, thisBooking.peopleAmount);

    thisBooking.dom.peopleAmount.addEventListener('click', function(){

    });

    thisBooking.hoursAmountWidget = new AmountWidget(thisBooking.dom.hoursAmount, thisBooking.hoursAmount);

    thisBooking.dom.hoursAmount.addEventListener('click', function(){

    });

    thisBooking.datePickerWidget = new DatePicker(thisBooking.dom.datePicker);

    thisBooking.hourPickerWidget = new HourPicker(thisBooking.dom.hourPicker);
  }
}
export default Booking;
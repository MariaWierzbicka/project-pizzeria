import {select, templates, settings, classNames} from '../settings.js';
import {utils} from '../utils.js';
import AmountWidget from './AmountWidget.js';
import DatePicker from './DatePicker.js';
import HourPicker from './HourPicker.js';


class Booking{
  constructor(element){
    const thisBooking = this;

    thisBooking.tableId = null;
    thisBooking.starters = [];

    thisBooking.render(element);
    thisBooking.initWidgets();
    thisBooking.getData();

  }
  getData(){
    const thisBooking = this;
    
    const startDateParam = settings.db.dateStartParamKey + '=' + utils.dateToStr(thisBooking.datePicker.minDate);
    const endDateParam = settings.db.dateEndParamKey + '=' + utils.dateToStr(thisBooking.datePicker.maxDate);

    const params = {
      bookings: [
        startDateParam,
        endDateParam,
      ],
      eventsCurrent: [
        settings.db.notRepeatParam,
        startDateParam,
        endDateParam,
      ],
      eventsRepeat: [
        settings.db.repeatParam,
        endDateParam,
      ],
    };

    const urls = {
      bookings: settings.db.url + '/' + settings.db.bookings + '?' + params.bookings.join('&'),
      eventsCurrent: settings.db.url + '/' + settings.db.events + '?' + params.eventsCurrent.join('&'),
      eventsRepeat: settings.db.url + '/' + settings.db.events + '?' + params.eventsRepeat.join('&'),
    };

    Promise.all([
      fetch(urls.bookings),
      fetch(urls.eventsCurrent),
      fetch(urls.eventsRepeat),
    ])
      .then(function(allResponses){
        const bookingsResponse = allResponses[0];
        const eventsCurrentResponse = allResponses[1];
        const eventsRepeatResponse = allResponses[2];
        return Promise.all([
          bookingsResponse.json(),
          eventsCurrentResponse.json(),
          eventsRepeatResponse.json(),
        ]);
      })
      .then(function([bookings, eventsCurrent, eventsRepeat]){
        thisBooking.parseData(bookings, eventsCurrent, eventsRepeat);
      });
  }

  parseData(bookings, eventsCurrent, eventsRepeat){
    const thisBooking = this;

    thisBooking.booked = {};

    for (let item of bookings){
      thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
    }
    for (let item of eventsCurrent){
      thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
    }

    const minDate = thisBooking.datePicker.minDate;
    const maxDate = thisBooking.datePicker.maxDate;

    for (let item of eventsRepeat){
      if (item.repeat == 'daily'){
        for(let loopDate = minDate; loopDate <= maxDate; loopDate = utils.addDays(loopDate, 1)){
          thisBooking.makeBooked(utils.dateToStr(loopDate), item.hour, item.duration, item.table);
        }
      }
    }

    thisBooking.updateDOM();
  }

  makeBooked(date, hour, duration, table){
    const thisBooking = this;

    if (typeof thisBooking.booked[date] === 'undefined'){
      thisBooking.booked[date] = {};
    }

    const startHour = utils.hourToNumber(hour);

    for (let hourBlock = startHour; hourBlock < startHour + duration; hourBlock += 0.5){

      if (typeof thisBooking.booked[date][hourBlock] === 'undefined'){
        thisBooking.booked[date][hourBlock] = [];
      }
  
      thisBooking.booked[date][hourBlock].push(table);
    }

    thisBooking.updateDOM();
  }

  updateDOM(){
    const thisBooking = this;
    thisBooking.date = thisBooking.datePicker.value;
    thisBooking.hour = utils.hourToNumber(thisBooking.hourPicker.value);

    let allAvailable = false;

    if(
      typeof thisBooking.booked[thisBooking.date] == 'undefined'
      ||
      typeof thisBooking.booked[thisBooking.date][thisBooking.hour] == 'undefined'
    ){
      allAvailable = true;
    }

    for (let table of thisBooking.dom.tables){
      table.classList.remove(classNames.booking.tableSelected);
      let tableId = table.getAttribute(settings.booking.tableIdAttribute);

      if(!isNaN(tableId)){
        tableId = parseInt(tableId);
      }
      if(
        !allAvailable
        &&
        thisBooking.booked[thisBooking.date][thisBooking.hour].includes(tableId)
      ){
        table.classList.add(classNames.booking.tableBooked);
      } else {
        table.classList.remove(classNames.booking.tableBooked);
      }
    } 
      
  }
  
  render(element){
    const thisBooking = this;
    
    const generatedHTML = templates.bookingWidget();

    thisBooking.dom = {};
    thisBooking.dom.wrapper = element;

    thisBooking.dom.wrapper.innerHTML = utils.createDOMFromHTML(generatedHTML).innerHTML;

    thisBooking.dom.peopleAmount = document.querySelector(select.booking.peopleAmount);
    thisBooking.dom.hoursAmount = document.querySelector(select.booking.hoursAmount);
    thisBooking.dom.tables = document.querySelectorAll(select.booking.tables);
    thisBooking.dom.datePicker = document.querySelector(select.widgets.datePicker.wrapper);
    thisBooking.dom.hourPicker = document.querySelector(select.widgets.hourPicker.wrapper);
    thisBooking.dom.floorPlan = document.querySelector(select.booking.floorPlan);

    thisBooking.dom.bookingSubmit = document.querySelector(select.booking.bookingSubmit);
    thisBooking.dom.bookingPhone = document.querySelector(select.booking.bookingPhone);
    thisBooking.dom.bookingAddress = document.querySelector(select.booking.bookingAddress);
    
  }
  initWidgets(){
    const thisBooking = this;

    thisBooking.peopleAmountWidget = new AmountWidget(thisBooking.dom.peopleAmount, thisBooking.peopleAmount);

    thisBooking.dom.peopleAmount.addEventListener('click', function(){
    });

    thisBooking.hoursAmountWidget = new AmountWidget(thisBooking.dom.hoursAmount, thisBooking.hoursAmount);

    thisBooking.dom.hoursAmount.addEventListener('click', function(){
    });

    thisBooking.datePicker = new DatePicker(thisBooking.dom.datePicker);
    thisBooking.hourPicker = new HourPicker(thisBooking.dom.hourPicker);

    thisBooking.dom.wrapper.addEventListener('updated', function(){
      thisBooking.updateDOM();
    });

    thisBooking.dom.floorPlan.addEventListener('click', function(event){
      event.preventDefault();
      const selectedTable = event.target;

      thisBooking.initTables(selectedTable);
    });

    thisBooking.dom.bookingSubmit.addEventListener('click', function(event){
      event.preventDefault();
      thisBooking.sendBooking();
    });
  }
  initTables(selectedTable){
    const thisBooking = this;
    const thisTable = selectedTable;

    const tables = document.querySelectorAll(select.booking.tables);
    const tableId = thisTable.getAttribute(settings.booking.tableIdAttribute);

    if(thisTable.classList.contains(select.booking.table)){      
      if(!thisTable.classList.contains(classNames.booking.tableBooked)){
        for (let table of tables){
          if (table.classList.contains(classNames.booking.tableSelected) && table.getAttribute(settings.booking.tableIdAttribute) != tableId){
            table.classList.remove(classNames.booking.tableSelected);
          }
        }
        thisTable.classList.toggle(classNames.booking.tableSelected);
        if (thisTable.classList.contains(classNames.booking.tableSelected)){
          thisBooking.tableId = parseInt(tableId);
        } else {
          thisBooking.tableId = null;
        }
      } else {
        alert('This table is not available, please choose another.');
      }      
    }

  }
  sendBooking(){
    const thisBooking = this;

    const url = settings.db.url + '/' + settings.db.bookings;

    const payload = {
      date: thisBooking.datePicker.value,
      hour: utils.numberToHour(parseInt(thisBooking.hourPicker.value)),
      table: parseInt(thisBooking.tableId),
      duration: thisBooking.hoursAmountWidget.value,
      ppl: thisBooking.peopleAmountWidget.value,
      starters: [],
      phone: thisBooking.dom.bookingPhone.value,
      address: thisBooking.dom.bookingAddress.value,
    };

    const starters = document.querySelectorAll(select.booking.starters);
    
    for(let starter of starters){ 
      if (starter.checked){
        payload.starters.push(starter.value);
      }
    }

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    };
    
    fetch(url, options)
      .then(function(response){
        return response.json();
      }).then(function(parsedResponse){
        console.log('parsedResponse', parsedResponse);
      });
    
    thisBooking.makeBooked(payload.date, payload.hour.toString(), payload.duration, payload.table);
  }
}
export default Booking;

const {google} = require('googleapis');

//https://github.com/google/google-api-nodejs-client/blob/82920f4731eb16140f8bb7fabc9e06a3777a1d65/src/apis/calendar/v3.ts
//

function overlap(xmin1,xmax1,xmin2,xmax2){
  return (xmax1 >= xmin2 && xmax2 >= xmin1)
}

module.exports = class CalendarApi { //extends

  constructor(){
    this.client = {}; //new authed client
    //https://github.com/google/google-api-nodejs-client/blob/82920f4731eb16140f8bb7fabc9e06a3777a1d65/src/apis/calendar/v3.ts#L3968
  }

  async listEvents({ timeMin, timeMax, maxResults = 250 } = {}) {
    const calendar = google.calendar({version: 'v3', auth: this.client });
    try {
      const { data: { items } } = await new Promise((rs,rx)=>calendar.events.list({
        calendarId: 'primary',
        timeMin,
        timeMax,
        maxResults,
        orderBy: 'startTime',
      },(err,res) => (err) ? rx(err) : rs(res)));
      return items;
    } catch (e){
      logger.error(e);
      throw e;//TODO:
    }
    /*const events = res.data.items;
    if (events.length) {
      console.log('Upcoming events:');
      events.map((event, i) => {
        const start = event.start.dateTime || event.start.date;
        console.log(`${start} - ${event.summary}`);
      });
    } */ 
  }


}

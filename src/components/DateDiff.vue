<template>
  <div>
<span>
<slot :days="days" :hours="hours" :minutes="minutes">{{days}} days {{hours}} hours {{ minutes}} minutes</slot>
</span>
  </div>
</template>

<script>
export default {
  data() {
   return {
      interval:null,
      days:0,
      hours:0,
      minutes:0,
//      seconds:0,
      intervals:{
        second: 1000,
        minute: 1000 * 60,
        hour: 1000 * 60 * 60,
        day: 1000 * 60 * 60 * 24
      }
    }
  },
  props:{
    date:{
      required:true
    }
  },
  mounted() {
    this.interval = setInterval(() => {
      this.updateDiffs();
    },1000);
    
    this.updateDiffs();
  },
  destroyed() {
    clearInterval(this.interval);    
  },
  methods:{
    updateDiffs() {
      //lets figure out our diffs
      let diff = Math.abs(Date.now() - this.date.getTime());
      this.days = Math.floor(diff / this.intervals.day);
      diff -= this.days * this.intervals.day;
      this.hours = Math.floor(diff / this.intervals.hour);
      diff -= this.hours * this.intervals.hour;
      this.minutes = Math.floor(diff / this.intervals.minute);
      diff -= this.minutes * this.intervals.minute;
      //this.seconds = Math.floor(diff / this.intervals.second);
    }
  }
}
</script>

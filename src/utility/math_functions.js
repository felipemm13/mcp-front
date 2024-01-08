export function rand(min, max, seed) {
    min = min || 0;
    max = max || 1;
    var rand;
    if (typeof seed === "number") {
      seed = (seed * 9301 + 49297) % 233280;
      var rnd = seed / 233280;
      var disp = Math.abs(Math.sin(seed));
      rnd = rnd + disp - Math.floor(rnd + disp);
      rand = Math.floor(min + rnd * (max - min + 1));
    } else {
      rand = Math.floor(Math.random() * (max - min + 1)) + min;
    }
    return rand;
  }
  
  export function n_rand(max_num_play, num_of_plays, seed) {
    if (num_of_plays <= max_num_play) {
      let intialArray = Array.from(
        { length: max_num_play },
        (_, index) => index + 1
      );
      let finalArray = [];
      let seedArray = seed.toString().split("").map(Number);
      let counter = 0;
      for (let i = 0; i < num_of_plays; i++) {
        counter += seedArray[i % seedArray.length];
        finalArray.push(intialArray.splice(counter % intialArray.length, 1)[0]);
      }
      return finalArray;
    } else {
      alert("error");
      return [];
    }
  }
  
  export function n_rand_2(max_num_play, num_of_plays, seed) {
    if (num_of_plays <= max_num_play) {
      let intialArray = Array.from({ length: max_num_play }, (_, index) => index);
      let finalArray = [];
      let seedArray = seed.toString().split("").map(Number);
      let counter = 0;
      for (let i = 0; i < num_of_plays; i++) {
        counter += seedArray[i % seedArray.length];
        finalArray.push(intialArray.splice(counter % intialArray.length, 1)[0]);
      }
      return finalArray;
    } else {
      alert("error");
      return [];
    }
  }
  
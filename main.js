"use strict";
let dataVis = {
  dataURL: "board-game-data.csv",
};

function processData(data){
  console.dir(data);
}

function rowConverter(data){
  return {
    rank: parseInt(data.rank),
    id: data.game_id,
    name: data.names,
    year: data.year,
    players: {
      min: parseInt(data.min_players),
      max: parseInt(data.max_players)
    },
    playtime: {
      min: parseInt(data.min_time),
      avg: parseInt(data.avg_time),
      max: parseInt(data.max_time)
    },
    mechanics: data.mechanic.split(',').map(d => d.trim()),
    categories:  data.category.split(',').map(d => d.trim()),
  }
}

function setup(){
  d3.csv(dataVis.dataURL, rowConverter).then(processData);
}

window.onload = setup;
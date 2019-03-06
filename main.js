"use strict";

let dataURL = "board-game-data.csv";
var dataset = {};
var categoryData = {};
var mechanicData = {};

// Dimensions used by all charts
let width = 100;
let height = 100;
let xPadding = 10;
let yInnerPadding = 0.1;
let yOuterPadding = 0.1;

let color = 'grey';

let key = (data) => data.id;

//Charting functions
function createBarChart(data,getX,getY){
  //Create scales
  let xScale = d3.scaleLinear()
    .domain([0,xData.max])
    .rangeRound([0,width-(xPadding)]);
  let yScale = d3.scaleBand()
    .domain([0,yData.max])
    .rangeRound([0,height])
    .paddingInner(yInnerPadding)
    .paddingOuter(yOuterPadding);
  
  //Create svg chart
  let chart = d3.select('#charts').append('svg')
    .attribute('width',width)
    .attribute('height',height);
  
  chart.select('rect')
    .data(data,key)
    .enter()
    .append('rect')
    .attribute('x',xPadding)
    .attribute('y',(d) => yScale(getY(d)))
    .attribute('width',(d) => xScale(getX(d)))
    .attribute('height',yScale.bandwidth())
    .attribute('fill',color);
}

function createCategoryChart(data){
  
}

function createMechanicsChart(data){
  
}

function createPlayersChart(data){
  
}

function createPlaytimeChart(data){
  
}

//Helper functions

function getArrayValuesCount(data, getArray){
  let counts = {};
  
  let values = data.map(getArray).flat();
  
  //console.dir(values);
  
  //unique values counting solution from https://stackoverflow.com/questions/12749200/how-to-count-array-elements-by-each-element-in-javascript
  for(var i = 0; i < values.length; i++){
    counts[values[i]] = (counts[values[i]]+1) || 1;
  }
  //console.dir(counts);
  let entries = Object.entries(counts);
  return entries;
}

function getCategories(data){
  return getArrayValuesCount(data,(d) => d.categories).map((entry) => {
    return {
      category: entry[0],
      count: entry[1]
    }
  });
}

function getMechanics(data){
  return getArrayValuesCount(data,(d) => d.mechanics).map((entry) => {
    return {
      mechanic: entry[0],
      count: entry[1]
    }
  });
}

function processData(data){
  console.dir(data);
  dataset = data;
  
  categoryData = getCategories(data);
  mechanicData = getMechanics(data);
  
  //console.dir(categoryData);
  //console.dir(mechanicData);
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

//Setup
function setup(){
  d3.csv(dataURL, rowConverter).then(processData);
}

window.onload = setup;
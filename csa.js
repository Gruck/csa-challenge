#!/usr/bin/env node

'use strict'

const DEP = 0, ARR = 1, DEP_TS = 2, ARR_TS = 3
const MAX_STATION = 100000
const INFINITY = Math.pow(2, 32) - 1

let timetable = new Uint32Array(4)
let timetableLength = 0 // Actual number of elements in 'timetable'

const inConn = new Uint32Array(MAX_STATION)
const earliestArr = new Uint32Array(MAX_STATION)

function compute(trip) { // Crankshaft-optimizable (Node v5.0.0)
  let route = []
  let station

  inConn.fill(INFINITY)
  earliestArr.fill(INFINITY)
  earliestArr[trip[DEP]] = trip[DEP_TS]

  for (let i = 0 ; i < timetableLength ; i = i + 4 /* [1] */) {
    // [1]: Crankshaft doesn't support let compound assignements ('i += 4').
    if (
      timetable[i + DEP_TS] >= earliestArr[timetable[i + DEP]] &&
      timetable[i + ARR_TS] <  earliestArr[timetable[i + ARR]]
    ) {
      inConn[timetable[i + ARR]] = i
      earliestArr[timetable[i + ARR]] = timetable[i + ARR_TS]
    } else if (timetable[i + DEP_TS] > earliestArr[trip[ARR]]) {
      break
    }
  }

  if (inConn[trip[ARR]] === INFINITY) {
    return null
  }

  station = trip[ARR]
  while (station !== trip[DEP]) {
    route.unshift(timetable.slice(inConn[station], inConn[station] + 4))
    station = route[0][DEP]
  }

  return route
}

let initializing = true
require('readline')
  .createInterface({ input: process.stdin })
  .on('line', function (line) {
    if (!line) {
      if (!initializing) {
        this.close()
      }
      initializing = false
      return
    }

    let connOrTrip = Uint32Array.from(line.split(' '))
    if (initializing) {
      if (timetable.length === timetableLength) {
        let aux = new Uint32Array(timetable.length << 1)
        aux.set(timetable)
        timetable = aux
      }
      timetable.set(connOrTrip, timetableLength)
      timetableLength += 4
    } else {
      let route = compute(connOrTrip)

      if (route) {
        console.log(route.map((c) => c.join(' ')).join('\n'), '\n')
      } else {
        console.log('NO_SOLUTION')
      }
    }
  })

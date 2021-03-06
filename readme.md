# CSA Challenge

At Captain Train, we need to compute train routes to find the best combination
with different train operators.

Our core routing engine is written in C++ and is based on the
Connection Scan Algorithm.

We had many conversations, both trolls and genuine curiosity how the routing works.

So we decided a very simple challenge: implement your own routing engine. It is the best
way to learn how the algorithm works and prove that your language is the most expressive,
the most to fun to write code with, the fastest, the safest…

## The data

The timetable is expressed by a collection of tuples (departure station, arrival station, departure timestamp, arrival timestamp).

The stations are identified by an index. Timestamps are unix timestamp. Do not worry about timezones, validity days etc. We crunched the data before. It is not the most
memory efficient implementation, but it is the easiest (and some argue with the best performance).

Every tuple is called a *connection*. So the connection (1, 2, 3600, 7200) means that you can take a train from station 1 the
1st of January 1970 at 1:00 and the following stop of the train will be at 2:00 at the station 2.

The data will be provided as a space separated values.

The tuple are ordered by departure timestamp stored in an indexed array.

## The algorithm

The CSA is very simple. For every station `s` we keep the best arrival time and arrival connection. We call those two connections
`arrival_timestamp[s]` and `in_connection[s]`.

We want to go from `o` to `d` leaving at the timestamp `t0`

### Initialisation

```
For each station s
    arrival_timestamp[s] = infinite
    in_connection[s] = invalid_value

arrival_timestamp[o] = t0
```

### Main loop

We iterate over all the connections to see if we can improve any connection.

Once we have explored all connections, we have computed all the earliest arrival routes from `o` to any other station.

```
For each connection c
    if arrival_timestamp[c.departure_station] < c.departure_timestamp and arrival_timestamp[c.arrival_station] > c.arrival_timestamp
        arrival_timestamp[c.arrival_station] ← c.arrival_timestamp
        in_connection[c.arrival_station] = c
```

### Getting the actual path back

We just need to go from `d` and look up all the in_connections until we reach `o` and we have the path and the timetable.

### Immediate optimizations

There is no need to look all the connections. We start with the first having `departure_timestamp > t0` and we stop
as soon as `c.departure_timestamp > arrival_timestamp`.

## Limitations

While this algorithm find routes, there are the following limitations to be aware of:

1. it computes the earliest arrival. However, a better solution might leaver later and arrive at the same time
2. the route with the least connections will not be computed
3. no connection time is considered: you might have to run to get the next train
4. multiple stations in a City like Paris are not considered

### Pushing the limits
`test2.rb` and `test3.rb` offer tests that cover those limitation.

#### Input
`test2.rb` doesn't change input structure with regard to the original tests.

`test3.rb` sends a indications on station that are in the same icity and requiered time using local public transportation between the timetable and requests. Exemple :
```
1 2 3600 7200
2 3 7800 9000

3 4 1000

1 3 3000

```

#### Output
`test2.rb` now expects two main solutions :
* the one arriving the earliest, yet leaving the latest.
* the one with the least number of transfers, still arriving the earliest and leaving the latest.
For each of those two, an safe alternative route must be offerd (if any) when connection transfer time is inferior to 900(=15 minutes)
Tests expect each solution to be prefixed by a solution type, namely : `EARLIEST_ARRIVAL`,  `EARLIEST_ARRIVAL_WITH_EASY_TRANSFERS`,  `LEAST_CONNECTIONS ` and `LEAST_CONNECTIONS_WITH_EASY_TRANSFERS`. 

`test3.rb` doesn't change expected output structure with regard to `test2.rb`.

## Input/output

Your program should read from the standard input.

The timetable is given one connection per line, each value of the tuple is space separated.

An empty line indicates that the input is done. The following lines are a route request with three values separated by spaces:
`departure_station arrival_station departure_timestamp`. A new line indicates that the program should stop.

Here is a example of input

```
1 2 3600 7200
2 3 7800 9000

1 3 3000

```

The output should be a line for each connection on the standart output. An empty line indicates the end of the output. Hence the answer shall be

```
1 2 3600 7200
2 3 7800 9000

```

## Reference implementation

An implementation in C++11 is available.

It can be compiled with ```g++ $CPPFLAGS --std=c++11 -O3 -o csa_cpp csa.cc```

Run the test with ```ruby test.rb ./csa_cpp```

## Haskell implementation

Debian packages:
- haskell
- bin-utils

Build: ```ghc -o csa_hs -Wall -O3 csa.hs && strip csa_hs```

Run the test with ```ruby test.rb ./csa_hs```

## Java implementation

Build: ```javac CSA.java```

Run the test with ```ruby test.rb "java CSA"```

## Lua implementation

Run the test with ```ruby test.rb "luajit csa.lua"```

## Rust implementation

Build: ```cargo build --release```

Run the test with ```ruby test.rb ./target/release/csa_rs```


## NodeJS implementation
Requires NodeJS installed

Dependency installation: ```npm install .```

Run the test with ```ruby test.rb "node ."```
Run the test with ```ruby test2.rb "node csa2.js"``` to run tests that cover limitations 1, 2 and 3
Run the test with ```ruby test3.rb "node csa3.js"``` to run tests that cover limitations 1, 2, 3 and 4

## Challenge

Try to write:

* The first implementation passing the tests
* Smallest source code (measured in bytes). Any library installable without an external repository on Debian, Ubuntu, Archlinux is accepted
* Smallest executable (same rule considering dependencies)
* The most unreadable
* The least alphanumerical characters
* The most creative implementation of the algorithm

## Benchmarking

We included 48 hours of train connections in Europe starting the January 1st 1970.
The data is not real, but pretty close.

You can run the benchmark with ```ruby bench.rb ./csa_cpp```

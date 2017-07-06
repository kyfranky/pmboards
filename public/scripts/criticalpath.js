function calcCPM(data, lastData) {

  console.log("jalan")

  /**
   * Activity Class
   * XE: new Activity({
 *		id: 'A',
 *		duration: 8,
 *      	predecessors: ['C','B']
 *	});
   */
  function Activity(configs) {
    var self = this;
    configs = configs || {};
    self.id = configs.id;
    self.duration = configs.duration;
    self.est = configs.est; //Earliest Start Time
    self.lst = configs.lst; //Latest Start Time
    self.eet = configs.eet; //Earliest End Time
    self.let = configs.let; //Latest End Time
    self.h = configs.h; //clearance (holgura)
    self.successors = [];
    self.predecessors = configs.predecessors || [];
    return self;
  }

  /**
   * List of Activities Class
   *
   */
  function ActivityList() {
    //Private vars
    var self = this;
    var processed = false;
    var list = {};
    var start, end;

    /**
     * Add an activity to the list
     */
    self.addActivity = function (activity) {
      list[activity.id] = activity;
    };

    /**
     * Private method Pre process list
     * Adds and sets the start and end node
     * Replaces successors and predecessors Ids for pointers
     * @throws Error if a predecessor not exists
     */
    function processList() {
      if (processed) {
        return; //Already processed
      }
      processed = true;

      start = new Activity({id: 'start', duration: 0});

      //Replaces id for pointers to actvities
      for (var i in list) {
        var current = list[i];
        var predecessorsIds = current.predecessors;
        var predecessors = [];

        if (predecessorsIds.length == 0) {
          predecessors.push(start);
          start.successors.push(current);
        } else {
          for (var j in predecessorsIds) {
            var previous = list[predecessorsIds[j]];
            if (!previous) {
              throw new Error('Node ' + j + ' dont exists');
            }
            predecessors.push(previous);
            previous.successors.push(current);
          }
        }
        current.predecessors = predecessors;
      }

    }

    /**
     * Private function set Earliest Times
     * Earliest Start Time (est) and Earliest End Time (eet)
     * Recursively browse starting from root
     */
    function setEarlyTimes(root) {
      for (var i in root.successors) {
        var node = root.successors[i];

        var predesessors = node.predecessors;
        for (var j in predesessors) {
          var activity = predesessors[j];
          if (node.est == null || node.est < activity.eet)
            node.est = activity.eet;
        }
        node.eet = node.est + node.duration;
        setEarlyTimes(node);
      }
    }


    /**
     * Private function set Latest Times
     * Latest Start Time (est) and Latest End Time (eet)
     * Recursively browse starting from root
     */
    function setLateTimes(root) {
      if (root.successors.length == 0) {
        root.let = root.eet;
        root.lst = root.let - root.duration;
        root.h = root.eet - root.let;
      } else {
        for (var i in root.successors) {
          var node = root.successors[i];
          setLateTimes(node);
          if (root.let == null || root.let > node.lst) {
            root.let = node.lst;
          }
        }

        root.lst = root.let - root.duration;
        root.h = root.let - root.eet;
      }
    }


    /**
     * Build Critical Path Tree recursively
     *
     */
    function buildCriticalPath(root, path) {
      if (root.h == 0) {
        var predecessors = root.predecessors;
        for (var i in predecessors) {
          var node = predecessors[i];
          if (node.h == 0) {
            var clone = new Activity({
              id: node.id,
              duration: node.duration,
              est: node.est,
              lst: node.lst,
              eet: node.eet,
              let: node.let,
              h: node.h
            });
            //Dont add start ... its just a fake node
            if (node !== start) {
              path.predecessors.push(clone);
              buildCriticalPath(node, clone);
            }

          }
        }
      }

    }

    /**
     * Applies the PEM, with little modification
     * Returns a Graph subset with the structure of the involved activities
     */
    self.getCriticalPath = function (endid) {
      if (!endid) {
        throw new Error('End activity id is required!');
      }
      end = list[endid];
      if (!end) {
        throw new Error('Node end dont not match');
      }
      //Make sure that list is well defined
      processList();

      //Setup Start Times
      start.est = 0;
      start.eet = 0;
      setEarlyTimes(start);

      //Setup End Times
      end.let = end.eet;
      end.lst = end.let - end.duration;
      end.h = end.eet - end.let;
      setLateTimes(start);

      //Assemble Critical Path (tree)
      var path = null;
      if (end.h == 0) {
        var path = new Activity({
          id: end.id,
          duration: end.duration,
          est: end.est,
          lst: end.lst,
          eet: end.eet,
          let: end.let,
          h: end.h
        });

        buildCriticalPath(end, path);
      }
      return path;
    };

    /**
     * Get the activity list, does a preprocessing (only once)
     */
    self.getList = function () {
      processList();
      return list;
    };
    return self;
  };


  var table = new ActivityList();

  data.forEach(function (item) {
    table.addActivity(new Activity(item));
  });

  const path = table.getCriticalPath(lastData);

  console.log(data)

  const result = mapit(path);

  return result;

  function mapit(data) {
    let temp = [];
    console.log(data)
    if(!data) return temp
    temp.push(data);
    if (data.predecessors.length !== 0) {
      data.predecessors.forEach(function (a) {
        $.merge(temp,mapit(a));
      });
      return temp;
    }
    return temp;
  }


}

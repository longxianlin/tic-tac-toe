var API = function() {
  var self = this;
  this.socket = io.connect("http://localhost");
  this.handlers = {};
  this.once_handlers = {};

  this.socket.on("data", function(data) {
    if(data && data.event) {
      console.log("================================== DATA")
      console.log(data)

      var handlers = self.handlers[data.event];
      if(handlers != null) {
        for(var i = 0; i < handlers.length; i++) {
          data.is_error ? handlers[i](data) : handlers[i](null, data);
        }
      }
      
      var handlers = self.once_handlers[data.event];
      if(handlers != null) {
        while(handlers.length > 0) {
          data.is_error ? handlers.pop()(data) : handlers.pop()(null, data);
        }
      }
    }
  });
}

API.prototype.on = function(event, callback) {
  if(this.handlers[event] == null) this.handlers[event] = [];
  this.handlers[event].push(callback);
}

API.prototype.once = function(event, callback) {
  if(this.once_handlers[event] == null) this.once_handlers[event] = [];
  this.once_handlers[event].push(callback);
}

/** 
 * Available api methods
 */
API.prototype.register = function(full_name, user_name, password, callback) {  
  // Do basic validation
  if(full_name == null || full_name.length == 0) return callback(create_error("register", "Full name cannot be empty"));
  if(user_name == null || user_name.length == 0) return callback(create_error("register", "User name cannot be empty"));
  if(password == null || password.length == 0) return callback(create_error("register", "Password name cannot be empty"));
  // Register callback
  this.once("register", callback);
  // Fire message
  this.socket.emit("register", {
      full_name: full_name
    , user_name: user_name
    , password: password
  });
}

API.prototype.login = function(user_name, password, callback) {  
  // Do basic validation
  if(user_name == null || user_name.length == 0) return callback(create_error("login", "User name cannot be empty"));
  if(password == null || password.length == 0) return callback(create_error("login", "Password name cannot be empty"));
  // Register callback
  this.once("login", callback);
  // Fire message
  this.socket.emit("login", {
      user_name: user_name
    , password: password
  });
}

API.prototype.find_all_available_gamers = function(callback) {  
  // Register callback
  this.once("find_all_available_gamers", function(err, data) {
    if(err) return callback(err, null);
    callback(null, data.games);
  });
  // Fire message
  this.socket.emit("find_all_available_gamers", {});
}

API.prototype.join_game = function(game_id, callback) {  
}

API.prototype.place_marker = function(game_id, x, y, callback) {  
}

API.prototype.quit_game = function(game_id, callback) {  
}

API.prototype.fetch_statistics = function(user_id, callback) {  
}

var create_error = function(event, err) {
  return {
      event: event
    , ok: false
    , is_error: true
    , error: err
  }
}

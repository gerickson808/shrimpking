app.factory('Firebase', function(Component, Session, $rootScope) {
  var firebase;
  var firebaseComponents;
  var firebaseUsers;
  var currentUser = Session.id || Math.round(10000*Math.random());
  var activeUsers = [];

  var factory = {
    connect: function(wireframe, $scope) {
      //don't think we need to do three firebase refs, maybe just one and add child...not sure which is better
      firebase = new Firebase("https://shining-torch-5682.firebaseio.com/projects/" + wireframe.project + "/wireframes/" + wireframe._id);
      firebaseUsers = new Firebase("https://shining-torch-5682.firebaseio.com/projects/" + wireframe.project + "/wireframes/" + wireframe._id + "/users");
      firebaseComponents = new Firebase("https://shining-torch-5682.firebaseio.com/projects/" + wireframe.project + "/wireframes/" + wireframe._id + "/components");
      
      //add current user to room
      firebaseUsers.child(currentUser).set('connected');
      
      //for every user change, set up disconnect handler depending on number of users currently connected
      //this feels quite hacky, though I can't figure out a good way to delete components if everyone leaves a room
      function setOnDisconnect() {
        if(activeUsers.length<=1) {
          firebase.onDisconnect().remove();  
        } else {
          firebase.onDisconnect().cancel();
          firebaseUsers.onDisconnect().cancel();
        }
        firebaseUsers.child(currentUser).onDisconnect().remove();
      };

      //Event listener, log users joining room
      firebaseUsers.on('child_added', function(snapshot) {
        activeUsers.push(snapshot.key());
        console.log(activeUsers);
        setOnDisconnect();
      });

      //Event listener, log users leaving room
      firebaseUsers.on('child_removed', function(snapshot) {
        activeUsers = activeUsers.filter(function(user) {
          return user !== snapshot.key();
        })
        setOnDisconnect();
      });

      //Event listener, create element any time a user adds one
      firebaseComponents.on('child_added', function(snapshot) {
        var key = snapshot.key();
        var element = snapshot.val();
// <<<<<<< HEAD
        Component.create(element.type, $scope, element.style, key, element.dataset);
// =======
//         Component.create(element.type, $scope, element.style, key, element.source);
// >>>>>>> 825d56e7b2f4ef57e4d8baed36e7453f4f2a14f4
      });

      //Event listener, edit element any time a user changes one
      firebaseComponents.on('child_changed', function(snapshot) {
        var key = snapshot.key();
        var element = snapshot.val();
// <<<<<<< HEAD
        Component.update(key, element.style, element.dataset);
        $rootScope.$broadcast('element-changed');
// =======
//         Component.update(key, element.style, element.source);
// >>>>>>> 825d56e7b2f4ef57e4d8baed36e7453f4f2a14f4
      });

      //Event listener, delete element any time a user removes one
      firebaseComponents.on('child_removed', function(snapshot) {
        var key = snapshot.key();
        var element = snapshot.val();
        Component.deleteComponent(key);
      });

      //Event listener, update element any time a user changes it
      var selectedElement;
      $('#wireframe-board').on('mousedown', '.component', function(event) {
        selectedElement = $(this);
        console.log(selectedElement);
        $(window).on('mouseup', function() {
          var component = Component.saveComponent(selectedElement);
          var key = component.id;
          firebaseComponents.child(key).update({
            style: component.style,
            dataset: component.dataset
          });
        });
      });
    },

    checkForComponents: function(wireframeId, projectId) {
      var firebase = new Firebase("https://shining-torch-5682.firebaseio.com/projects/" + projectId + '/wireframes/' + wireframeId);
      
      //firebase promises not working => made our own
      return new Promise(function(resolve, reject) {
        firebase.once('value', function(data) {
          resolve(data);
        }, function(err) {
          reject(err);
        });
      });
    },

    checkForWireframes: function(projectId){
      var firebase = new Firebase("https://shining-torch-5682.firebaseio.com/projects/" + projectId + '/wireframes/');
        
      //firebase promises r dum
      return new Promise(function(resolve, reject) {
        firebase.once('value', function(data) {
          resolve(data);
        }, function(err) {
          reject(err);
        });
      });

    },

    createRoom: function(wireframe, $scope) {
      factory.connect(wireframe, $scope);
      
      //load current components to firebase
      if (wireframe.components) {
        wireframe.components.forEach(function(component) {
          factory.createElement(component.style, component.type, component.source);
        });
      }
    },

    joinRoom: function(wireframe, $scope) {
      factory.connect(wireframe, $scope);
      
      //load in existing firebase objects
      firebaseComponents.once('value', function(data) {
        if (data.components) {
          data.components.forEach(function(component) {
// <<<<<<< HEAD
            Component.create(component.type, $scope, component.style, component.id, component.dataset);
          });
// =======
//             Component.create(component.type, $scope, component.style, component.id, component.source);
//           })
// >>>>>>> 825d56e7b2f4ef57e4d8baed36e7453f4f2a14f4
        }
      });
    },

// <<<<<<< HEAD
    createElement: function(style, type, dataset) {
      console.log("sent dataset = ",dataset)
      var blobject = {
        style: style,
        type: type,
        dataset: dataset
      };
      console.log("object being sent to firebase is ", blobject);
      firebaseComponents.push(blobject);
// =======
//     createElement: function(style, type, source) {
//       firebaseComponents.push({
//         style: style,
//         type: type,
//         source: source || ""
//       });
// >>>>>>> 825d56e7b2f4ef57e4d8baed36e7453f4f2a14f4
    },

    deleteElement: function(event) {
      var innerDiv = event.target.parentNode;
      var outerDiv = innerDiv.parentNode;
      var outerouterDiv = outerDiv.parentNode;
      var id = outerouterDiv.id;
      console.log(id, "the ID"); //gotta figure out how to put ID in the button div to avoid the parent parent parent...
      firebaseComponents.child(id).remove(function() {
        console.log("deleting element?? ?");
      });
    },

// <<<<<<< HEAD
    updateElement: function(element, style, dataset) {
      Component.update(element.id, style, dataset);
// =======
//     updateElement: function(element, style) {
//       Component.update(element.id, style, source);
// >>>>>>> 825d56e7b2f4ef57e4d8baed36e7453f4f2a14f4
    },

  };
  return factory;

});

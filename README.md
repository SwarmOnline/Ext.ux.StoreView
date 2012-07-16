Ext.ux.StoreView
================

## Overview

This class is an override to the Ext.data.Store class and introduces a concept of "Views" (in the database sense) to the Store class.

I felt this was necessary as it wasn't easy to display two (or more) subsets of the same data store without having to manually maintain these subsets individually.

For example, an application could display a list of Todos in a sidebar for the current user and a main grid containing everyone's Todos. To have a single data store containing __all__ the records and then filter these into a second data store to get the current users set.

This could have been easier if we could define a View filter which was maintained and updated as necessary automatically and I could simply bind this sidebar list to this view.

## Usage

To use this class simply include it in your project (either by adding a script tag or requiring it) and add a 'views' config option in the store configuration.

For example, imagine having a Ext.data.Store that contains a list of Todos and we want a View containing all the Todos for me.

We would first create the store and add its views config. Our filterFn is exactly the same as the ones you would pass to the filterBy method - it accepts one parameter of the current record and returns true if you want the record to be included and false to omit it.

    var store = Ext.create('Ext.data.Store', {
    	model: 'Todo',
    	proxy: {
    		...
    	},
    	views: [{
    		name: 'MyTodos',
    		filterFn: function(rec){
    			return rec.get('User') === 'Stuart';
    		}
    	}]
    });

Now we have a store we can bind the main store and the view to their relevant components.

    var list = Ext.create('Ext.List', {
    	…
    	store: store.getView('MyTodos')
    	…
    });
    
    var list = Ext.create('Ext.List', {
    	…
    	store: store
    	…
    });
    
If you then manipulate the records in the main store the views' stores will be updated to reflect this automatically so you don't have to worry about it.

## Compatibility

This class is compatible with Sencha Touch 2 and Ext JS 4. Although all the examples are focused on Touch it will work fine with Ext JS 4 too.

## Planned Updates

* Introduce lazy instantiation so View stores are only created when referenced.
* Fix issue with views config option causing errors.
* Find better way to link view's records to main records.
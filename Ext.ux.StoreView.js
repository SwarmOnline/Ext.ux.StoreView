/**
 * Ext.ux.StoreView
 */
Ext.define('Ext.ux.StoreView', {

    override: 'Ext.data.Store',

    config: {

	    /**
	     * @cfg {Object[]} views The views configuration. This must have the following properties:
	     *
	     *  - {String} name The name of the view that will be used as its identifier when retrieving it later. This should be a valid JavaScript object key.
	     *  - {Function} filterFn This is the function that will be used to determine the records that are included in the view. This will be passed to the underlying Ext.util.MixedCollection instance's filterBy method and so should
	     *                        accept 1 parameter (the current model instance) and return true or false determining if the record will be included in the dataset.
	     */

    },

	constructor: function(){
		this.callParent(arguments);

		// if the 'views' config was supplied with an array with at least one item then we set it up
		if(this.getViewInstances() && Ext.isArray(this.getViewInstances()) && this.getViewInstances().length > 0){
			this.initViews();
		} else {
			this.config.views = {};
		}

		this.initEvents();
	},

	/**
	 * Bind handlers to the Store's events to keep Views up to date.
	 * @method
	 * @private
	 * @return {void}
	 */
	initEvents: function(){
		// Bind to the add, remove and update events so the views are refreshed when the data changes.
		this.on({
			addrecords: this.refreshViews,
			updaterecord: this.refreshViews,
			removerecords: this.refreshViews,
			refresh: this.refreshViews,
			scope: this
		});
	},

	/**
	 * Initialises the additional View stores and populates them with its current data set.
	 * Each view will have an object created containing the following properties:
	 *  - {Ext.data.Store} store The View store. This can be used to bind to a list or dataview etc.
	 *  - {Object} view The original View configuration including the name and filterFn.
	 *  @method
	 *  @private
	 *  @returns {void}
	 */
	initViews: function(){
		var i = 0,
			l = this.getViewInstances().length,
			view,
			views = {};

		for(; i < l; i++){
			view = this.getViewInstances()[i];

			views[view.name] = this.createView(view);
		}

		this.config.views = views;
	},

	/**
	 * Creates a Views Store based on the configuration shown and merges it with the config object.
	 * Loads the relevant data into the store straight away.
	 * @method
	 * @private
	 * @param {Object} viewCfg The View configuration object
	 * @return {Object} The original View configuration with the new store included
	 */
	createView: function(viewCfg){
		Ext.apply(viewCfg, {

			store: Ext.create('Ext.data.Store', {
				model: this.getModel(),
				data: this.data.filterBy(viewCfg.filterFn, this, true).items
			}),

			refresh: Ext.bind(this.refreshView, this, [viewCfg.name], true)
		});

		return viewCfg;
	},

	/**
	 * Add a new View to the Store and then returns it.
	 * If the new view's name conflicts with an existing one it will be overwritten.
	 * @method
	 * @public
	 * @param {Object} viewCfg The View's configuration. See the views config for details
	 * @returns {Object} The created View object. Contains all original config properties and a 'store' property
	 */
	addView: function(viewCfg){
		var existingView = this.getView(viewCfg);
		if(existingView && existingView.name){
			console.log('View with the name "' + viewCfg.name + '" already exists... overwriting.')
		}

		var newView = this.createView(viewCfg);

		this.getViewInstances()[newView.name] = newView;

		return newView;
	},

	/**
	 * Refreshes each of the configured Views with the parent store's current dataset.
	 * @method
	 * @public
	 * @returns {void}
	 */
	refreshViews: function(){
		var views = this.getViewInstances(),
			view;

		for (var property in views) {
			if (views.hasOwnProperty(property)) {
				view = views[property];

				this.refreshView(view);
			}
		}
	},

	/**
	 * Refreshes a single View's data.
	 * @param {Object/String} view Either a View object or the name of the View to be refreshed
	 * @method
	 * @private
	 * @returns {void}
	 */
	refreshView: function(view){
		if(Ext.isString(view)){
			view = this.getViewData(view);
		}

		// remove all records from the view
		view.store.removeAll();

		// readd the appropriate records from the main store to the View
		view.store.add(this.data.filterBy(view.filterFn, this, true).items);
	},

	/**
	 * Returns the actual record from the main data store rather than the View's copy.
	 * Pass in the View's record instance to have the main one returned.
	 * @method
	 * @public
	 * @param {Model} record A View's copy of a record.
	 * @return {Model} The original record instance from the main store.
	 */
	getActual: function(record){
		return this.getById(record.getId());
	},

	/**
	 * Returns the Views array containing the Views' stores and configs.
	 * This will return an Object with each View's object accessible via its configured 'name' (as the key)
	 * @method
	 * @public
	 * @return {Object} The View object in the format: { viewName: { store: ..., view: { name: viewName, filterFn: ... } } }
	 */
	getViewInstances: function(){
		return this.config.views;
	},

	/**
	 * Returns the specified View's store so it can be bound to a component etc.
	 * @method
	 * @param {String} viewName The name of the View to access (as configured by the 'name' property supplied originally)
	 * @method
	 * @public
	 * @return {Ext.data.Store} The View's store
	 */
	getView: function(viewName){
		var view = this.getViewData(viewName);

		return Ext.isEmpty(view) ? null : view.store;
	},

	/**
	 * Returns the specified View's full data object.
	 * @method
	 * @public
	 * @param {String} viewName The name of the View to retrieve
	 * @return {Object} The View object or undefined if not found
	 */
	getViewData: function(viewName){
		return this.getViewInstances()[viewName];
	}

});



Ext.define('Ext.override.Collection', {
	override: 'Ext.util.Collection',

	/**
	 * This override allows the filter to be applied to only the Collection's filtered items rather than the full item set.
	 * @param fn
	 * @param scope
	 * @param useFilteredItems
	 * @return {this.self}
	 */
	filterBy: function(fn, scope, useFilteredItems) {
		var me = this,
			newCollection = new this.self(),
			keys   = me.keys,
			items  = useFilteredItems ? me.items : me.all,
			length = items.length,
			i;

		newCollection.getKey = me.getKey;

		for (i = 0; i < length; i++) {
			if (fn.call(scope || me, items[i], keys[i])) {
				newCollection.add(keys[i], items[i]);
			}
		}

		return newCollection;
	}

});
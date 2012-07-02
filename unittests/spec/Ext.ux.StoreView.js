Ext.define('Ext.ux.Person', {
	extend: 'Ext.data.Model',
	config: {
		fields: ['Name', 'Age']
	}
});


describe("Ext.ux.StoreView", function(){
	var me = this;

	me.createStore = function(views){
		return Ext.create('Ext.data.Store', {
			model: 'Ext.ux.Person',
			views: views,
			data: [{
				Name: 'Stuart',
				Age: 25
			}, {
				Name: 'Stuart2',
				Age: 11
			}, {
				Name: 'Stuart3',
				Age: 7
			}, {
				Name: 'Stuart4',
				Age: 44
			}, {
				Name: 'Stuart5',
				Age: 90
			}, {
				Name: 'Stuart6',
				Age: 33
			}, {
				Name: 'Stuart7',
				Age: 66
			}, {
				Name: 'Stuart8',
				Age: 2
			}, {
				Name: 'Stuart9',
				Age: 28
			}, {
				Name: 'Stuart10',
				Age: 16
			}, {
				Name: 'Stuart11',
				Age: 111
			}]
		});
	};

	afterEach(function () {

		//  destroy any stores that are hanging about so our memory usage doesn't rocket...
		Ext.Array.each(Ext.StoreManager.items, function(store){
			store.destroy();
		});
	});

	describe("Views are created", function(){

		it("getViews method returns an array of View objects", function(){
			var store = me.createStore([{
				name: 'View1',
				filterFn: Ext.emptyFn
			}, {
				name: 'View2',
				filterFn: Ext.emptyFn
			}]);

			expect(Ext.isObject(store.getViews())).toEqual(true);
			expect(store.getViews().View1).toBeDefined();
			expect(store.getViews().View2).toBeDefined();

		});

		it("Each View has a store in it", function(){
			var store = me.createStore([{
				name: 'View1',
				filterFn: Ext.emptyFn
			}, {
				name: 'View2',
				filterFn: Ext.emptyFn
			}]);

			var views = store.getViews();

			Ext.Object.each(views, function(key, val){
				expect(val.name).toEqual(key);
				expect(val.store).toBeDefined();
				expect(val.store.$className).toEqual('Ext.data.Store');
			}, this);
		});

		it("Each View has correct number of records in it", function(){
			var store = me.createStore([{
				name: 'View1',
				filterFn: function(rec){
					return rec.get('Age') > 20;
				}
			}, {
				name: 'View2',
				filterFn: function(rec){
					return rec.get('Age') < 20;
				}
			}]);

			var views = store.getViews();

			expect(views.View1.store.getCount()).toEqual(7);
			expect(views.View2.store.getCount()).toEqual(4);
		});
	});

	describe("Adding Views", function(){

		it("addView returns View object", function(){
			var store = me.createStore([{
				name: 'View1',
				filterFn: Ext.emptyFn
			}, {
				name: 'View2',
				filterFn: Ext.emptyFn
			}]);

			var addedView = store.addView({
				name: 'View3',
				filterFn: Ext.emptyFn
			});

			expect(Ext.isObject(addedView)).toEqual(true);
			expect(addedView.store).toBeDefined();
			expect(addedView.store.$className).toEqual('Ext.data.Store');
		});

		it("Added View is in getViews object", function(){
			var store = me.createStore([{
				name: 'View1',
				filterFn: Ext.emptyFn
			}, {
				name: 'View2',
				filterFn: Ext.emptyFn
			}]);

			var addedView = store.addView({
				name: 'View3',
				filterFn: Ext.emptyFn
			});

			var views = store.getViews();

			expect(views.View3).toBeDefined();
			expect(addedView).toEqual(views.View3); // returned view is same as retrieved view
			expect(Ext.isObject(views.View3)).toEqual(true);
			expect(views.View3.store).toBeDefined();
			expect(views.View3.store.$className).toEqual('Ext.data.Store');

		});

		it("Added View's store has correct number of records", function(){
			var store = me.createStore([{
				name: 'View1',
				filterFn: function(rec){
					return rec.get('Age') > 20;
				}
			}, {
				name: 'View2',
				filterFn: function(rec){
					return rec.get('Age') < 20;
				}
			}]);

			var addedView = store.addView({
				name: 'View3',
				filterFn: function(rec){
					return rec.get('Age') > 20;
				}
			});

			var views = store.getViews();

			expect(views.View3.store.getCount()).toEqual(7);
		});
	});



	describe("Refreshing Views", function(){

		it("Updating record is updated in all stores", function(){
			var store = me.createStore([{
				name: 'View1',
				filterFn: function(rec){
					return rec.get('Age') > 20;
				}
			}, {
				name: 'View2',
				filterFn: function(rec){
					return rec.get('Age') < 20;
				}
			}]);

			// find the main store record using Name
			var rec = store.getAt(store.find('Name', 'Stuart9'));

			// update the record
			rec.set('Age', 30);

			// find the record from the View using Name
			var recIndex = store.getView('View1').find('Name', 'Stuart9'),
				viewRec = store.getView('View1').getAt(recIndex);

			expect(rec.get('Age')).toEqual(30);
			expect(viewRec.get('Age')).toEqual(30);
		});

		it("Added record is updated in all stores", function(){
			var store = me.createStore([{
				name: 'View1',
				filterFn: function(rec){
					return rec.get('Age') > 20;
				}
			}, {
				name: 'View2',
				filterFn: function(rec){
					return rec.get('Age') < 20;
				}
			}]);

			// create and add new record
			var newRec = Ext.create('Ext.ux.Person', {
				Name: 'New Record',
				Age: 99
			});

			store.add(newRec);

			// retrieve new record in main store and View1
			var rec = store.getAt(store.find('Name', 'New Record')),
				recIndex = store.getView('View1').find('Name', 'New Record');

			expect(rec).toBeDefined();
			expect(recIndex).toBeGreaterThan(-1);
		});

		it("Removed record is removed from all stores", function(){
			var store = me.createStore([{
				name: 'View1',
				filterFn: function(rec){
					return rec.get('Age') > 20;
				}
			}, {
				name: 'View2',
				filterFn: function(rec){
					return rec.get('Age') < 20;
				}
			}]);

			// find the main store record using Name
			var rec = store.getAt(store.find('Name', 'Stuart9'));

			store.remove(rec);

			expect(store.find('Name', 'Stuart9')).toEqual(-1);
			expect(store.getView('View1').find('Name', 'Stuart9')).toEqual(-1);

		});
	});

});
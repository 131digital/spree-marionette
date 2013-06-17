SpreeStore.module('Cart',function(Cart, SpreeStore, Backbone,Marionette,$,_){
  Cart.Controller = {
    showCartInfo: function() {
      if (SpreeStore.current_order_id !== undefined) {
        model = new SpreeStore.Models.Order({ 
          id: SpreeStore.current_order_id
        })
        var cart_info_view = new Cart.CartInfoView({
          model: model
        })
        model.fetch({
          data: $.param({ order_token: SpreeStore.current_order_token}),
          success: function(data) {
            SpreeStore.cartInfo.show(cart_info_view)
          }
        })
      }
    },
    addToCart: function(id, quantity) {
      if (SpreeStore.current_order_id === undefined) {
        Cart.Controller.newCheckout(id, quantity)
      } else {
        Cart.Controller.addLineItem(id, quantity)
      }
    },

    newCheckout: function(id, quantity) {
      $.ajax({
        type: 'POST', 
        url: '/store/api/orders',
        data: {
          order: {
            line_items_attributes: [
              {
                variant_id: id,
                quantity: quantity
              }
            ]
          }
        },
        success: function(data) {
          window.localStorage['current_order_token'] = SpreeStore.current_order_token = data.token
          window.localStorage['current_order_id'] = SpreeStore.current_order_id = data.number
          Cart.Controller.updateCart(data)
        }
      })
    },

    addLineItem: function(id, quantity) {
      $.ajax({
        type: 'post',
        url: '/store/api/orders/' + SpreeStore.current_order_id + '/line_items',
        data: {
          order_token: SpreeStore.current_order_token,
          line_item: {
            variant_id: id,
            quantity: quantity
          }
        },
        success: function(data) {
          Cart.Controller.updateCart()
        }
      })
    },

    updateCart: function(data) {
      Cart.Controller.showCartInfo()
      Cart.Controller.preview()
    },

    preview: function() {

      if (SpreeStore.current_order_id) {
        model = new SpreeStore.Models.Order({ id: SpreeStore.current_order_id })
        model.fetch({ 
          data: $.param({ order_token: SpreeStore.current_order_token}),
          success: function(data) {
            cart_view = new Cart.CartView({
              model: data,
              collection: new SpreeStore.Models.LineItems(data.attributes.line_items)
            })

            SpreeStore.mainRegion.show(cart_view)
            SpreeStore.noSidebar()
          }
        });
      } else {
        emptyCartView = new Cart.EmptyCart
        SpreeStore.mainRegion.show(emptyCartView)
      }
    }
  }
})
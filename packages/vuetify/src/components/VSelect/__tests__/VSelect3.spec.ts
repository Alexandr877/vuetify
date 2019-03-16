// Components
import VSelect from '../VSelect'

// Utilities
import {
  mount,
  Wrapper
} from '@vue/test-utils'

describe('.ts', () => {
  type Instance = InstanceType<typeof VSelect>
  let mountFunction: (options?: object) => Wrapper<Instance>

  beforeEach(() => {
    mountFunction = (options = {}) => {
      return mount(VSelect, {
        ...options
      })
    }
  })

  it('should update model when chips are removed', async () => {
    const selectItem = jest.fn()
    const wrapper = mountFunction({
      propsData: {
        chips: true,
        deletableChips: true,
        items: ['foo'],
        value: 'foo'
      },
      methods: { selectItem }
    })

    const input = jest.fn()
    const change = jest.fn()

    wrapper.vm.$on('input', input)

    expect(wrapper.vm.internalValue).toEqual('foo')
    wrapper.find('.v-chip__close').trigger('click')

    expect(input).toHaveBeenCalledTimes(1)

    wrapper.setProps({
      items: ['foo', 'bar'],
      multiple: true,
      value: ['foo', 'bar']
    })
    wrapper.vm.$on('change', change)
    await wrapper.vm.$nextTick()

    expect(wrapper.vm.internalValue).toEqual(['foo', 'bar'])
    wrapper.find('.v-chip__close').trigger('click')

    await wrapper.vm.$nextTick()

    expect(selectItem).toHaveBeenCalledTimes(1)
  })

  it('should set selected index', async () => {
    const wrapper = mountFunction({
      propsData: {
        chips: true,
        deletableChips: true,
        multiple: true,
        items: ['foo', 'bar', 'fizz', 'buzz'],
        value: ['foo', 'bar', 'fizz', 'buzz']
      }
    })

    expect(wrapper.vm.selectedIndex).toBe(-1)

    const foo = wrapper.find('.v-chip')
    foo.trigger('click')

    expect(wrapper.vm.selectedIndex).toBe(0)

    wrapper.find('.v-chip')[1].trigger('click')

    expect(wrapper.vm.selectedIndex).toBe(1)

    wrapper.setProps({ disabled: true })

    wrapper.find('.v-chip').trigger('click')

    expect(wrapper.vm.selectedIndex).toBe(1)
  })

  it('should not duplicate items after items update when caching is turned on', async () => {
    const wrapper = mountFunction({
      propsData: {
        cacheItems: true,
        returnObject: true,
        itemText: 'text',
        itemValue: 'id',
        items: []
      }
    })

    wrapper.setProps({ items: [{ id: 1, text: 'A' }] })
    expect(wrapper.vm.computedItems).toHaveLength(1)
    wrapper.setProps({ items: [{ id: 1, text: 'A' }] })
    expect(wrapper.vm.computedItems).toHaveLength(1)
  })

  it('should cache items', async () => {
    const wrapper = mountFunction({
      propsData: {
        cacheItems: true,
        items: []
      }
    })

    wrapper.setProps({ items: ['bar', 'baz'] })
    expect(wrapper.vm.computedItems).toHaveLength(2)

    wrapper.setProps({ items: ['foo'] })
    expect(wrapper.vm.computedItems).toHaveLength(3)

    wrapper.setProps({ items: ['bar'] })
    expect(wrapper.vm.computedItems).toHaveLength(3)
  })

  it('should cache items passed via prop', async () => {
    const wrapper = mountFunction({
      propsData: {
        cacheItems: true,
        items: [1, 2, 3, 4]
      }
    })

    expect(wrapper.vm.computedItems).toHaveLength(4)

    wrapper.setProps({ items: [5] })
    expect(wrapper.vm.computedItems).toHaveLength(5)
  })

  it('should have an affix', async () => {
    const wrapper = mountFunction({
      propsData: {
        prefix: '$',
        suffix: 'lbs'
      }
    })

    expect(wrapper.find('.v-text-field__prefix').element.innerHTML).toBe('$')
    expect(wrapper.find('.v-text-field__suffix').element.innerHTML).toBe('lbs')

    wrapper.setProps({ prefix: undefined, suffix: undefined })

    await wrapper.vm.$nextTick()

    expect(wrapper.find('.v-text-field__prefix')).toHaveLength(0)
    expect(wrapper.find('.v-text-field__suffix')).toHaveLength(0)
  })

  it('should use custom clear icon cb', () => {
    const clearIconCb = jest.fn()
    const wrapper = mountFunction({
      propsData: {
        clearable: true,
        items: ['foo'],
        value: 'foo'
      }
    })

    wrapper.vm.$on('click:clear', clearIconCb)
    wrapper.find('.v-input__icon--clear .v-icon').trigger('click')

    expect(clearIconCb).toHaveBeenCalled()
  })

  it('should populate select[multiple=false] when using value as an object', async () => {
    const wrapper = mountFunction({
      attachToDocument: true,
      propsData: {
        items: [
          { text: 'foo', value: { id: { subid: 1 } } },
          { text: 'foo', value: { id: { subid: 2 } } }
        ],
        multiple: false,
        value: { id: { subid: 2 } }
      }
    })

    await wrapper.vm.$nextTick()

    const selections = wrapper.find('.v-select__selection')

    expect(selections).toHaveLength(1)
  })

  it('should add color to selected index', async () => {
    const wrapper = mountFunction({
      propsData: {
        multiple: true,
        items: ['foo', 'bar'],
        value: ['foo']
      }
    })

    wrapper.vm.selectedIndex = 0

    await wrapper.vm.$nextTick()

    expect(wrapper.html()).toMatchSnapshot()
  })

  it('should not react to click when disabled', async () => {
    const wrapper = mountFunction({
      propsData: { items: ['foo', 'bar'] }
    })
    const slot = wrapper.find('.v-input__slot')
    const input = wrapper.find('input')

    expect(wrapper.vm.isMenuActive).toBe(false)
    slot.trigger('click')
    expect(wrapper.vm.isMenuActive).toBe(true)

    wrapper.setData({ isMenuActive: false })
    wrapper.setProps({ disabled: true })
    await wrapper.vm.$nextTick()
    expect(wrapper.vm.isMenuActive).toBe(false)

    slot.trigger('click')
    expect(wrapper.vm.isMenuActive).toBe(false)
  })

  it('should set the menu index', () => {
    const wrapper = mountFunction()

    expect(wrapper.vm.getMenuIndex()).toBe(-1)

    wrapper.vm.setMenuIndex(1)

    expect(wrapper.vm.getMenuIndex()).toBe(1)
  })

  // Inspired by https://github.com/vuetifyjs/vuetify/pull/1425 - Thanks @kevmo314
  it('should open the select when focused and enter, space, up or down are pressed', async () => {
    const wrapper = mountFunction()

    wrapper.vm.hasMouseDown = true
    wrapper.trigger('mouseup')

    expect(wrapper.vm.isMenuActive).toBe(false)

    wrapper.setProps({ box: true })
    wrapper.vm.hasMouseDown = true
    wrapper.find('.v-input__slot').trigger('mouseup')

    expect(wrapper.vm.isMenuActive).toBe(true)

    wrapper.setData({ isMenuActive: false })
    wrapper.setProps({ box: false, solo: true })
    wrapper.vm.hasMouseDown = true
    wrapper.find('.v-input__slot').trigger('mouseup')

    expect(wrapper.vm.isMenuActive).toBe(true)

    wrapper.setData({ isMenuActive: false })
    wrapper.setProps({ solo: false, soloInverted: true })
    wrapper.vm.hasMouseDown = true
    wrapper.find('.v-input__slot').trigger('mouseup')

    expect(wrapper.vm.isMenuActive).toBe(true)

    wrapper.setData({ isMenuActive: false })
    wrapper.setProps({ soloInverted: false, outline: true })
    wrapper.vm.hasMouseDown = true
    wrapper.find('.v-input__slot').trigger('mouseup')

    expect(wrapper.vm.isMenuActive).toBe(true)
  })

  it('should return full items if using auto prop', () => {
    const wrapper = mountFunction({
      propsData: {
        items: [...Array(100).keys()]
      }
    })

    expect(wrapper.vm.virtualizedItems).toHaveLength(20)

    wrapper.setProps({ menuProps: 'auto' })

    expect(wrapper.vm.virtualizedItems).toHaveLength(100)
  })

  it('should fallback to using text as value if none present', () => {
    const wrapper = mountFunction({
      propsData: {
        items: [{
          text: 'foo'
        }]
      }
    })

    expect(wrapper.vm.getValue(wrapper.vm.items[0])).toBe('foo')
  })

  it('should accept arrays as values', async () => {
    const wrapper = mountFunction({
      propsData: {
        items: [
          { text: 'Foo', value: ['bar'] }
        ]
      }
    })

    const input = jest.fn()
    wrapper.vm.$on('input', input)

    wrapper.vm.selectItem(wrapper.vm.items[0])

    await wrapper.vm.$nextTick()

    expect(input).toHaveBeenCalledWith(['bar'])
    expect(wrapper.vm.selectedItems).toEqual([
      { text: 'Foo', value: ['bar'] }
    ])
  })

  // https://github.com/vuetifyjs/vuetify/issues/4359
  // Vue modifies the `on` property of the
  // computed `listData` — easiest way to fix
  it('should select value when using a scoped slot', async () => {
    const wrapper = mountFunction({
      propsData: {
        items: ['foo', 'bar']
      },
      slots: {
        'no-data': {
          render: h => h('div', 'No Data')
        }
      }
    })

    // Will be undefined if fails
    expect(wrapper.vm.listData.on).toBeTruthy()
  })

  // https://github.com/vuetifyjs/vuetify/issues/4431
  it('should accept null and "" as values', async () => {
    const wrapper = mountFunction({
      propsData: {
        clearable: true,
        items: [
          { text: 'Foo', value: null },
          { text: 'Bar', value: 'bar' }
        ],
        value: null
      }
    })

    const icon = wrapper.find('.v-input__append-inner .v-icon')

    expect(wrapper.vm.selectedItems).toHaveLength(1)
    expect(wrapper.vm.isDirty).toBe(true)

    icon.trigger('click')

    await wrapper.vm.$nextTick()

    expect(wrapper.vm.selectedItems).toHaveLength(0)
    expect(wrapper.vm.isDirty).toBe(false)
    expect(wrapper.vm.internalValue).toBeUndefined()
  })

  it('should only calls change once when clearing', async () => {
    const wrapper = mountFunction({
      propsData: {
        clearable: true,
        value: 'foo'
      }
    })

    const change = jest.fn()
    wrapper.vm.$on('change', change)

    const icon = wrapper.find('.v-input__icon > .v-icon')

    icon.trigger('click')

    await wrapper.vm.$nextTick()

    expect(change).toHaveBeenCalledTimes(1)
  })

  it('should not call change when model updated externally', async () => {
    const change = jest.fn()
    const wrapper = mountFunction()

    wrapper.vm.$on('change', change)

    wrapper.setProps({ value: 'bar' })

    expect(change).not.toHaveBeenCalled()

    wrapper.vm.setValue('foo')

    expect(change).toHaveBeenCalledWith('foo')
    expect(change).toHaveBeenCalledTimes(1)
  })

  // https://github.com/vuetifyjs/vuetify/issues/4713
  it('should nudge select menu', () => {
    const wrapper = mountFunction({
      propsData: {
        menuProps: {
          nudgeTop: 5,
          nudgeRight: 5,
          nudgeBottom: 5,
          nudgeLeft: 5
        }
      }
    })

    const menu = wrapper.vm.$refs.menu

    expect(menu.nudgeTop).toBe(5)
    expect(menu.nudgeRight).toBe(5)
    expect(menu.nudgeBottom).toBe(5)
    expect(menu.nudgeLeft).toBe(5)
  })

  // https://github.com/vuetifyjs/vuetify/issues/5774
  it('should close menu on tab down when no selectedIndex', async () => {
    const wrapper = mountFunction({
      propsData: {
        items: ['foo', 'bar']
      }
    })

    const menu = wrapper.find('.v-input__slot')
    const input = wrapper.find('input')

    menu.trigger('click')

    expect(wrapper.vm.isFocused).toBe(true)
    expect(wrapper.vm.isMenuActive).toBe(true)

    input.trigger('keydown.tab')

    await wrapper.vm.$nextTick()

    expect(wrapper.vm.isFocused).toBe(false)
    expect(wrapper.vm.isMenuActive).toBe(false)
  })
})

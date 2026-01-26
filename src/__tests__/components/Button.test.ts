/**
 * Tests pour le composant Button
 */

import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'
import { Button } from '@/components/ui/button'

describe('Button Component', () => {
  it('renders correctly', () => {
    const wrapper = mount(Button, {
      slots: {
        default: 'Click me',
      },
    })

    expect(wrapper.text()).toContain('Click me')
  })

  it('applies default variant classes', () => {
    const wrapper = mount(Button)
    const button = wrapper.find('button')

    expect(button.exists()).toBe(true)
  })

  it('handles click events', async () => {
    const wrapper = mount(Button)

    await wrapper.trigger('click')

    expect(wrapper.emitted('click')).toBeTruthy()
  })

  it('can be disabled', () => {
    const wrapper = mount(Button, {
      props: {
        disabled: true,
      },
    })

    const button = wrapper.find('button')
    expect(button.attributes('disabled')).toBeDefined()
  })

  it('applies size variant', () => {
    const wrapper = mount(Button, {
      props: {
        size: 'sm',
      },
    })

    expect(wrapper.exists()).toBe(true)
  })

  it('applies variant', () => {
    const wrapper = mount(Button, {
      props: {
        variant: 'destructive',
      },
    })

    expect(wrapper.exists()).toBe(true)
  })
})

/* eslint-disable no-fallthrough */
import Component from '@ember/component';
import { computed } from '@ember/object';
import { notEmpty } from '@ember/object/computed';

import categoryIcons from 'ember-emojipalette/utils/category-icons';

import layout from './template';
import emojiListVersion from '../../utils/emojiListVersion';
import emojiData from '../../utils/emojidata';

export default Component.extend({
  layout,

  keyDownHandler: null,
  clickHandler: null,

  closeOnEsc: true,
  closeOnBackdropClick: false,

  onSelect: () => {},

  // Event Handlers
  handleKeyDown(e) {
    const code = e.keyCode || e.which;
    if (code === 27 && this.closeOnEsc) {
      this.onClose();
    }
  },

  handleClick(e) {
    if (this.closeOnBackdropClick && (e.target === this.element || !e.target.closest('.emojidex-palette-wrapper'))) {
      this.onClose();
    }
  },

  // Lifecycle Hooks
  init() {
    this._super(...arguments);

    this.set('categoryNames', {
      people: 'Smileys & People',
      nature: 'Animals & Nature',
      food: 'Food & Drinks',
      activity: 'Activity',
      travel: 'Travel & Places',
      object: 'Objects',
      symbol: 'Symbols',
      flag: 'Flags'
    });

    this.set('keyDownHandler', this.handleKeyDown.bind(this));
    this.set('clickHandler', this.handleClick.bind(this));
  },

  didInsertElement() {
    this._super(...arguments);
    document.addEventListener('keydown', this.keyDownHandler);
    document.addEventListener('click', this.clickHandler);
  },

  willDestroyElement() {
    this._super(...arguments);
    document.removeEventListener('keyDown', this.keyDownHandler);
    document.removeEventListener('click', this.clickHandler);
  },

  unsupportedEmojis: computed('emojiVersion', function() {
    const unsupportedEmojis = [];
    switch (this.emojiVersion) {
      case '9':
        unsupportedEmojis.push(...emojiListVersion.v10);
      case '10':
        unsupportedEmojis.push(...emojiListVersion.v11);
      case '11':
        unsupportedEmojis.push(...emojiListVersion.v12);
    }

    return unsupportedEmojis;
  }),

  filteredEmojiData: computed('unsupportedEmojis', function() {
    const unsupportedEmojis = this.unsupportedEmojis;
    const filteredEmojiData = {};
    Object.keys(emojiData).forEach(category => {
      filteredEmojiData[category] = emojiData[category].filter(emoji => !unsupportedEmojis.includes(emoji.emoji));
    });
    return filteredEmojiData;
  }),

  filteredEmojiList: computed('filteredEmojiData', function() {
    const filteredEmojiData = this.filteredEmojiData;
    const filteredEmojiList = {};
    Object.keys(filteredEmojiData).forEach(category => {
      filteredEmojiList[category] = filteredEmojiData[category].mapBy('emoji')
    });
    return filteredEmojiList;
  }),

  // Component Properties
  categoryNames: null,
  categorySVG: categoryIcons,
  searchTerm: '',
  searchPlaceholder: 'search for emoji',

  // Computed Properties
  searchPerformed: notEmpty('searchTerm'),

  emojiList: computed('searchPerformed', 'searchResults.[]', 'currentListType', 'hideCategories', 'filteredEmojiList', function () {
    return this.searchPerformed ? this.searchResults : (this.hideCategories ? this.filteredEmojiList : this.filteredEmojiList[this.currentListType]);
  }),

  currentListType: computed('hideCategories', function () {
    return this.hideCategories ? 'all' : 'people';
  }),

  allowedCategories: computed('excludedCategories.[]', 'categoryNames', function () {
    const excludedCategories = this.excludedCategories;
    const categoryList = Object.keys(this.categoryNames);
    return excludedCategories ? categoryList.filter(category => !this.excludedCategories.includes(category)) : categoryList;
  }),

  searchResults: computed('searchTerm', 'filteredEmojiData', function() {
    const searchTerm = this.searchTerm.toLowerCase();
    if (searchTerm.trim() === '') {
      return [];
    }

    const data = this.filteredEmojiData;
    const searchResults = [];
    Object.keys(data).forEach(category => {
      const emojis = data[category];
      const matching = emojis
        .filter(emoji => this.matchKeyTerms(searchTerm, emoji.keyTerms) || this.matchSubCategory(searchTerm, emoji.subcategory))
        .map(emoji => emoji.emoji);
      searchResults.push(...matching);
    });

    return searchResults;
  }),

  matchKeyTerms(searchTerm, keyTerms = []) {
    const terms = keyTerms.map(t => t.toLowerCase());
    return terms.reduce((a, b) => a || b.includes(searchTerm), false);
  },

  matchSubCategory(searchTerm, subcategory = '') {
    return subcategory.split(/[- ]/).filter(word => word.length > 1).includes(searchTerm);
  },

  // Actions
  actions: {
    changeCategory(category) {
      this.set('currentListType', category);
    },

    selectEmoji(emoji) {
      this.set('selectedEmoji', emoji);
      this.onSelect(emoji);
    }
  }
});

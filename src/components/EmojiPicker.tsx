'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ─── Emoji Data by Category ──────────────────────────────
const EMOJI_CATEGORIES = [
  {
    id: 'smileys',
    label: '😊',
    title: 'Smileys',
    emojis: [
      '😀','😃','😄','😁','😆','😅','🤣','😂','🙂','🙃',
      '😉','😊','😇','🥰','😍','🤩','😘','😗','😚','😙',
      '🥲','😋','😛','😜','🤪','😝','🤑','🤗','🤭','🫢',
      '🤫','🤔','🫠','🤐','🤨','😐','😑','😶','😶‍🌫️','😏',
      '😒','🙄','😬','🤥','😌','😔','😪','🤤','😴','😷',
      '🤒','🤕','🤢','🤮','🤧','🥵','🥶','🥴','😵','🤯',
      '🤠','🥳','🥸','😎','🤓','🧐','😕','🫤','😟','🙁',
      '☹️','😮','😯','😲','😳','🥺','🫹','😦','😧','😨',
      '😰','😥','😢','😭','😱','😖','😣','😞','😓','😩',
      '😫','🥱','😤','😡','😠','🤬','😈','👿','💀','☠️',
    ],
  },
  {
    id: 'gestures',
    label: '👋',
    title: 'Gestures',
    emojis: [
      '👋','🤚','🖐️','✋','🖖','🫱','🫲','🫳','🫴','👌',
      '🤌','🤏','✌️','🤞','🫰','🤟','🤘','🤙','👈','👉',
      '👆','🖕','👇','☝️','🫵','👍','👎','✊','👊','🤛',
      '🤜','👏','🙌','🫶','👐','🤲','🤝','🙏','✍️','💅',
      '🤳','💪','🦾','🦿','🦵','🦶','👂','🦻','👃','🫀',
      '🫁','🧠','🦷','🦴','👀','👁️','👅','👄','🫦','💋',
    ],
  },
  {
    id: 'people',
    label: '👤',
    title: 'People',
    emojis: [
      '🧑','👶','🧒','👦','👧','🧑','👱','👨','🧔','🧔‍♂️',
      '👩','🧓','👴','👵','🙍','🙎','🙅','🙆','💁','🙋',
      '🧏','🙇','🤦','🤷','👮','🕵️','💂','🥷','👷','🫅',
      '🤴','👸','👳','👲','🧕','🤵','👰','🤰','🫄','🤱',
      '👼','🎅','🤶','🦸','🦹','🧙','🧚','🧛','🧜','🧝',
      '🧞','🧟','🧌','💆','💇','🚶','🧍','🧎','🏃','🧑‍🤝‍🧑',
    ],
  },
  {
    id: 'nature',
    label: '🌿',
    title: 'Nature',
    emojis: [
      '🐶','🐱','🐭','🐹','🐰','🦊','🐻','🐼','🐻‍❄️','🐨',
      '🐯','🦁','🐮','🐷','🐸','🐵','🙈','🙉','🙊','🐔',
      '🐧','🐦','🐤','🦆','🦅','🦉','🦇','🐺','🐗','🐴',
      '🦄','🐝','🪱','🐛','🦋','🐌','🐞','🐜','🦟','🦗',
      '🕷️','🦂','🐢','🐍','🦎','🦖','🦕','🐙','🦑','🦐',
      '🌸','🌺','🌻','🌹','🌷','🌼','💐','🍀','🌿','🌱',
      '🌲','🌳','🌴','🌵','🎋','🎍','🍁','🍂','🍃','🌾',
      '🌙','⭐','🌟','💫','✨','☄️','🌈','⛅','🌤️','🌦️',
      '🌧️','⛈️','🌩️','❄️','🌊','🌬️','🌀','🌪️','🌫️','🌂',
    ],
  },
  {
    id: 'food',
    label: '🍕',
    title: 'Food',
    emojis: [
      '🍎','🍊','🍋','🍇','🍓','🫐','🍈','🍑','🍒','🥭',
      '🍍','🥥','🥝','🍅','🍆','🥑','🥦','🥬','🥒','🌶️',
      '🫑','🧄','🧅','🥔','🍠','🫚','🫛','🌽','🍄','🧇',
      '🥞','🧈','🍳','🥚','🧀','🥓','🥩','🍗','🍖','🌭',
      '🍔','🍟','🍕','🫓','🥨','🥐','🥖','🫔','🧆','🌮',
      '🌯','🥗','🥘','🫕','🥫','🍝','🍜','🍲','🍛','🍣',
      '🍱','🥟','🦪','🍤','🍙','🍘','🍥','🥮','🍢','🧁',
      '🍰','🎂','🍮','🍭','🍬','🍫','🍿','🍩','🍪','🌰',
      '🥜','🍯','🧃','🥤','🧋','☕','🍵','🫖','🍺','🍻',
      '🥂','🍷','🥃','🍸','🍹','🍾','🫗','🧊','🥄','🍴',
    ],
  },
  {
    id: 'activities',
    label: '⚽',
    title: 'Activities',
    emojis: [
      '⚽','🏀','🏈','⚾','🥎','🎾','🏐','🏉','🥏','🎱',
      '🏓','🏸','🏒','🥍','🏑','🏏','🪃','🥅','⛳','🪁',
      '🎣','🤿','🎽','🎿','🛷','🥌','🎯','🪀','🪆','🎲',
      '🎮','🕹️','🎰','🃏','🀄','🎭','🎨','🖼️','🎪','🎤',
      '🎧','🎼','🎹','🥁','🪘','🎷','🎺','🪗','🎸','🎻',
      '🪕','🎬','🎥','📽️','🎞️','📞','☎️','📟','📠','📺',
      '🏆','🥇','🥈','🥉','🏅','🎖️','🎗️','🎫','🎟️','🎪',
    ],
  },
  {
    id: 'travel',
    label: '✈️',
    title: 'Travel',
    emojis: [
      '🚗','🚕','🚙','🚌','🚎','🏎️','🚓','🚑','🚒','🚐',
      '🛻','🚚','🚛','🚜','🏍️','🛵','🚲','🛴','🛺','🚁',
      '🛸','✈️','🛩️','🪂','🚀','🛶','⛵','🚤','🛥️','⛴️',
      '🏠','🏡','🏢','🏣','🏤','🏥','🏦','🏧','🏨','🏩',
      '⛩️','🕌','🕍','⛪','🗼','🗽','🗿','🏰','🏯','🌁',
      '🌃','🌄','🌅','🌆','🌇','🌉','🌌','🎠','🎡','🎢',
      '🎑','🏞️','🏜️','🏝️','🏖️','🏕️','🗻','🏔️','⛰️','🌋',
    ],
  },
  {
    id: 'objects',
    label: '💡',
    title: 'Objects',
    emojis: [
      '⌚','📱','💻','🖥️','🖨️','⌨️','🖱️','🖲️','💾','💿',
      '📀','📷','📸','📹','📼','📞','☎️','📟','📠','📺',
      '📻','🧭','⏱️','⏲️','⏰','🕰️','⌛','⏳','📡','🔋',
      '🔌','💡','🔦','🕯️','🪔','🧯','🛢️','💸','💵','💴',
      '💎','⚖️','🧲','🔧','🪛','🔨','⚒️','🛠️','⛏️','🔩',
      '🔑','🗝️','🔐','🔒','🔓','🚪','🪞','🪟','🛋️','🪑',
      '📦','📫','📪','📬','📭','📮','🗳️','✏️','✒️','🖊️',
      '📝','📁','📂','📅','📆','📇','📈','📉','📊','📋',
      '📌','📍','✂️','🗃️','🗄️','🗑️','🔏','🔐','🔑','🗺️',
    ],
  },
  {
    id: 'symbols',
    label: '❤️',
    title: 'Symbols',
    emojis: [
      '❤️','🧡','💛','💚','💙','💜','🖤','🤍','🤎','💔',
      '❤️‍🔥','❤️‍🩹','💕','💞','💓','💗','💖','💘','💝','💟',
      '☮️','✝️','☪️','🕉️','☸️','🪯','✡️','🔯','🕎','☯️',
      '💯','🔴','🟠','🟡','🟢','🔵','🟣','⚫','⚪','🟤',
      '🔺','🔻','🔷','🔶','🔹','🔸','🔲','🔳','▪️','▫️',
      '🚩','🎌','🏴','🏳️','🏁','🏳️‍🌈','🏳️‍⚧️','🏴‍☠️',
      '✅','❎','🆗','🆕','🆙','🆒','🆓','🔞','📵','🚫',
      '⭕','❌','🔀','🔁','🔂','▶️','⏩','⏪','⏫','⏬',
      '🔔','🔕','🔇','🔈','🔉','🔊','📢','📣','🎵','🎶',
      '💬','💭','🗯️','💤','🔥','💥','✨','🌟','💫','⚡',
    ],
  },
];

interface EmojiPickerProps {
  onSelect: (emoji: string) => void;
  onClose: () => void;
}

export default function EmojiPicker({ onSelect, onClose }: EmojiPickerProps) {
  const [activeCategory, setActiveCategory] = useState(0);
  const [search, setSearch] = useState('');
  const pickerRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  // Close on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleKey);
    };
  }, [onClose]);

  // Focus search on mount
  useEffect(() => {
    setTimeout(() => searchRef.current?.focus(), 50);
  }, []);

  // Filtered emojis when searching
  const searchResults = search.trim()
    ? EMOJI_CATEGORIES.flatMap((c) => c.emojis).filter((e) =>
        e.includes(search)
      )
    : null;

  const displayEmojis =
    searchResults ?? EMOJI_CATEGORIES[activeCategory].emojis;

  const handleEmojiClick = useCallback(
    (emoji: string) => {
      onSelect(emoji);
    },
    [onSelect]
  );

  return (
    <motion.div
      ref={pickerRef}
      initial={{ opacity: 0, scale: 0.92, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.92, y: 10 }}
      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
      className="emoji-picker"
      role="dialog"
      aria-label="Emoji picker"
    >
      {/* Search */}
      <div className="emoji-search-wrap">
        <svg className="emoji-search-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          ref={searchRef}
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search emoji…"
          className="emoji-search-input"
          aria-label="Search emoji"
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            className="emoji-search-clear"
            aria-label="Clear search"
          >
            ×
          </button>
        )}
      </div>

      {/* Category tabs */}
      {!search && (
        <div className="emoji-tabs" role="tablist" aria-label="Emoji categories">
          {EMOJI_CATEGORIES.map((cat, idx) => (
            <button
              key={cat.id}
              role="tab"
              aria-selected={activeCategory === idx}
              aria-label={cat.title}
              title={cat.title}
              onClick={() => setActiveCategory(idx)}
              className={`emoji-tab ${activeCategory === idx ? 'emoji-tab--active' : ''}`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      )}

      {/* Category title */}
      <div className="emoji-category-title">
        {search
          ? `Results for "${search}"`
          : EMOJI_CATEGORIES[activeCategory].title}
      </div>

      {/* Emoji grid */}
      <div
        className="emoji-grid"
        role="grid"
        aria-label={search ? 'Search results' : EMOJI_CATEGORIES[activeCategory].title}
      >
        {displayEmojis.length > 0 ? (
          displayEmojis.map((emoji, i) => (
            <button
              key={`${emoji}-${i}`}
              onClick={() => handleEmojiClick(emoji)}
              className="emoji-btn"
              title={emoji}
              aria-label={emoji}
              role="gridcell"
            >
              {emoji}
            </button>
          ))
        ) : (
          <div className="emoji-no-results">No emojis found</div>
        )}
      </div>
    </motion.div>
  );
}

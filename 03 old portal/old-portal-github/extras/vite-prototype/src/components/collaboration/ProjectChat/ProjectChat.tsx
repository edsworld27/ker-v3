import React from 'react';
import { Play } from 'lucide-react';
import { projectChatUI as ui } from './ui';

export const ProjectChat: React.FC = () => (
  <section className={`glass-card ${ui.wrapper.padding} ${ui.wrapper.radius} ${ui.wrapper.layout} ${ui.wrapper.height}`}>

    {/* Title */}
    <h3 className={`${ui.title.fontSize} ${ui.title.fontWeight} ${ui.title.gap}`}>{ui.title.label}</h3>

    {/* Messages */}
    <div className={`${ui.messages.layout} ${ui.messages.gap}`}>

      {/* Other person */}
      <div className={`${ui.bubbleOther.bg} ${ui.bubbleOther.radius} ${ui.bubbleOther.padding}`}>
        <div className={`${ui.bubbleOther.senderFontSize} ${ui.bubbleOther.senderFontWeight} ${ui.bubbleOther.senderColor} ${ui.bubbleOther.senderGap} ${ui.bubbleOther.senderTransform} ${ui.bubbleOther.senderTracking}`}>
          {ui.bubbleOther.senderLabel}
        </div>
        <p className={ui.bubbleOther.textSize}>{ui.bubbleOther.messageText}</p>
      </div>

      {/* Self */}
      <div className={`${ui.bubbleSelf.bg} ${ui.bubbleSelf.radius} ${ui.bubbleSelf.padding} ${ui.bubbleSelf.indent}`}>
        <div className={`${ui.bubbleSelf.senderFontSize} ${ui.bubbleSelf.senderFontWeight} ${ui.bubbleSelf.senderColor} ${ui.bubbleSelf.senderGap} ${ui.bubbleSelf.senderTransform} ${ui.bubbleSelf.senderTracking}`}>
          {ui.bubbleSelf.senderLabel}
        </div>
        <p className={ui.bubbleSelf.textSize}>{ui.bubbleSelf.messageText}</p>
      </div>

    </div>

    {/* Input */}
    <div className={ui.inputWrapper.position}>
      <input
        type="text"
        placeholder={ui.input.placeholder}
        className={`${ui.input.width} ${ui.input.bg} ${ui.input.border} ${ui.input.radius} ${ui.input.paddingY} ${ui.input.paddingLeft} ${ui.input.paddingRight} ${ui.input.fontSize} ${ui.input.outline} ${ui.input.focus} ${ui.input.transition}`}
      />
      <button className={`${ui.sendButton.position} ${ui.sendButton.padding} ${ui.sendButton.textColor} ${ui.sendButton.textColorHover} ${ui.sendButton.transition}`}>
        <Play className={ui.sendButton.iconSize} />
      </button>
    </div>

  </section>
);

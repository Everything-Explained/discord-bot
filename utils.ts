import { MessageEmbed } from 'discord.js';

export enum MessagePriority {
  LOW,
  MEDIUM,
  HIGH,
  BLACK,
}

export function setMessage(
  title: string,
  priority = -1,
  description = ''
) {
  return (
    new MessageEmbed()
      .setTitle(title)
      .setDescription(description)
      .setColor(getColorByPriority(priority))
  );
}

export function getLowMsg(title: string, description = '') {
  return setMessage(title, MessagePriority.LOW, description);
}

export function getMedMsg(title: string, description = '') {
  return setMessage(title, MessagePriority.MEDIUM, description);
}

export function getHighMsg(title: string, description = '') {
  return setMessage(title, MessagePriority.HIGH, description);
}

export function getDefinedMsg(title: string, description: string, img_url: string, timeCompleted: number) {
  const msg =
    new MessageEmbed()
      .setTitle(title)
      .setDescription(description)
      .setColor(getColorByPriority(MessagePriority.LOW))
      .setFooter(`Speed: ${timeCompleted}ms`)
  ;
  if (img_url) msg.setThumbnail(img_url);
  return msg;
}

export function capitalize(str: string) {
  return str[0].toUpperCase() + str.substring(1);
}

export function getColorByPriority(priority: MessagePriority) {
  if (MessagePriority.LOW == priority)    return '#57E0B8';
  if (MessagePriority.MEDIUM == priority) return '#FFD200';
  if (MessagePriority.HIGH == priority)   return '#FF559D';
  if (MessagePriority.BLACK == priority)  return '#6C00FF';
  return '#aaaaaa'
}
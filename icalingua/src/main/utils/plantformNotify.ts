import isInlineReplySupported from './isInlineReplySupported'
import avatarCache from './avatarCache'
import getAvatarUrl from '../../utils/getAvatarUrl'
import {showWindow} from './windowManager'
import ui from './ui'
import adapter from '../adapters/socketIoAdapter'
import {Notification} from 'freedesktop-notifications'
import {Notification as ElectronNotification} from 'electron'

export const message = async (data: {
    priority: 1 | 2 | 3 | 4 | 5
    roomId: number
    at: string | boolean
    data: { title: string; body: string; hasReply: boolean; replyPlaceholder: string }
    isSelfMsg: boolean
    image?: string
}) => {
    if (!ElectronNotification.isSupported()) return
    if (process.platform === 'darwin' || process.platform === 'win32') {
        const notif = new ElectronNotification({
            title: data.data.title,
            body: data.data.body,
            hasReply: data.data.hasReply,
            replyPlaceholder: data.data.replyPlaceholder,
            icon: getAvatarUrl(data.roomId, true),
            actions: [{
                text: '标为已读',
                type: 'button',
            }],
        })
        notif.on('click', () => {
            showWindow()
            ui.chroom(data.roomId)
        })
        notif.on('action', () => adapter.clearRoomUnread(data.roomId))
        notif.on('reply', (e, r) => {
            adapter.clearRoomUnread(data.roomId)
            adapter.sendMessage({
                content: r,
                roomId: data.roomId,
                at: [],
            })
        })
    }
    else {
        const actions = {
            default: '',
            read: '标为已读',
        }
        if (await isInlineReplySupported()) actions['inline-reply'] = '回复...'

        const notifParams = {
            ...data.data,
            summary: data.data.title,
            appName: 'Icalingua',
            category: 'im.received',
            'desktop-entry': 'icalingua',
            urgency: 1,
            timeout: 5000,
            icon: await avatarCache(getAvatarUrl(data.roomId, true)),
            'x-kde-reply-placeholder-text': '发送到 ' + data.data.title,
            'x-kde-reply-submit-button-text': '发送',
            actions,
        }
        if (data.image) notifParams['x-kde-urls'] = await avatarCache(data.image)
        const notif = new Notification(notifParams)
        notif.on('action', (action: string) => {
            switch (action) {
                case 'default':
                    showWindow()
                    ui.chroom(data.roomId)
                    break
                case 'read':
                    adapter.clearRoomUnread(data.roomId)
                    break
            }
        })
        notif.on('reply', (r: string) => {
            adapter.clearRoomUnread(data.roomId)
            adapter.sendMessage({
                content: r,
                roomId: data.roomId,
                at: [],
            })
        })
        notif.push()
    }
}

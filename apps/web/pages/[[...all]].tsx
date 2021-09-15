import Head from 'next/head'
import {useRouter} from 'next/router'
import axios from 'axios'
import {MouseEventHandler, useEffect, useState} from 'react'
import {Socket, io} from 'socket.io-client'

import {
  ClientRegister,
  EventTypes,
  MessageSend,
} from '@caster/events/event.types'

import Layout from '../components/Layout'

const DEFAULT_EPISODE_ID = '123'

export const Index = () => {
  const [loaded, setLoaded] = useState<boolean>(false)
  const [socket, setSocket] = useState<Socket>()
  const {
    query: {all},
  } = useRouter()
  const episodeId = Array.isArray(all) ? all[0] : all

  useEffect(() => {
    const initSocket = async () => {
      // There needs to be at least one HTTP call before we can upgrade to WS, so ping
      // the api index first.
      try {
        await axios.post('/api', {ping: true})
      } catch (error) {
        console.error(error)
      }

      const ws = io('/', {
        transports: ['websocket'],
        path: '/api/socket.io/',
      })

      ws.on('connect', () => {
        console.log('[socket] connected')

        const event: ClientRegister = {
          episodeId: episodeId || DEFAULT_EPISODE_ID,
        }

        ws.emit(EventTypes.ClientRegister, event)

        setSocket(ws)
      })

      ws.on('disconnect', () => {
        setSocket(undefined)
      })

      ws.on('connect_failed', () => {
        setSocket(undefined)
      })
    }

    if (loaded) {
      initSocket()
    }

    setLoaded(true)
  }, [loaded, episodeId, setSocket])

  const sendMessage: MouseEventHandler<HTMLButtonElement> = (_event) => {
    if (socket) {
      const event: MessageSend = {
        episodeId: episodeId || DEFAULT_EPISODE_ID,
        text: 'Sending Message',
      }

      socket.emit(EventTypes.MessageSend, event)
    } else {
      console.error('No socket initialized')
    }
  }

  return (
    <Layout>
      <Head>
        <title>Caster</title>
      </Head>
      <button onClick={sendMessage}>Send Message</button>
    </Layout>
  )
}

export default Index

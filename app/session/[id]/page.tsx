'use client'
import { useEffect, useState, useRef } from 'react'
import {
  doc,
  collection,
  onSnapshot,
  query,
  orderBy
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import {
  importPublicKey,
  deriveSharedSymmetricKey,
  decryptText
} from '@/lib/encryption'
import { loadPrivateKey } from '@/lib/storage'
import { useParams, useRouter } from 'next/navigation'
import { loadOwnPublic } from '@/lib/keys'
import { FaTimes } from 'react-icons/fa'
import { MdPhonelink } from 'react-icons/md'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import toast from 'react-hot-toast'
import { IoMdClipboard } from 'react-icons/io'
import QRCodeView from '@/components/QRCodeView'
import DeviceList from '@/components/DeviceList'
import TextList from '@/components/TextList'
import SendTextForm from '@/components/SendTextForm'
import SessionHeader from '@/components/SessionHeader'

export default function SessionPage(){
  const { id: sessionId } = useParams<{ id: string }>();
  const [sessionMeta, setSessionMeta] = useState<any>(null)
  const [devices, setDevices] = useState<Array<any>>([])
  const [newDeviceKeys, setNewDeviceKeys] = useState<Set<string>>(new Set())
  const [messages, setMessages] = useState<Array<any>>([])
  const [isCreator, setIsCreator] = useState(false)
  const router = useRouter();
  const { user } = useAuth();

  const privateKeyRef = useRef<CryptoKey | null>(null)
  const ownPubRef = useRef<string | null>(null)

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL;

  useEffect(()=>{
    let unsubSession: any
    let unsubMessages: any
    let unsubDevices: any

    async function init() {
      const ref = doc(db, 'sessions', sessionId)

      // Load private key
      const priv = await loadPrivateKey(sessionId)
      if (priv) {
        privateKeyRef.current = priv
        ownPubRef.current = loadOwnPublic(sessionId)
      } else {
        toast.error('No private key found locally. Join the session first.')
      }

      if(!ownPubRef.current) {
        router.push('/');
      }
      
      unsubSession = onSnapshot(ref, async (snap)=>{
        if (!snap.exists()) return
        const data = snap.data()
        setSessionMeta(data)

        const isSessionCreator = data.creatorPublicKeyBase64 === ownPubRef.current;
        setIsCreator(isSessionCreator)
      })

      // Listen to devices subcollection
      const devicesRef = collection(db, 'sessions', sessionId, 'devices');
      unsubDevices = onSnapshot(devicesRef, (snap) => {
        const devList: any[] = [];
        snap.forEach((doc) => devList.push(doc.data()));
        if (devList.length) {
          // detect new devices
          devList.forEach(d => {
            const key = d.publicKeyBase64 || d.publicKey || d.pub
            if (key && !devices.some(dd => (dd.publicKeyBase64 || dd.publicKey || dd.pub) === key)) {
              setNewDeviceKeys(prev => {
                const next = new Set(prev)
                next.add(key)
                setTimeout(() => {
                  setNewDeviceKeys(p => {
                    const n = new Set(p)
                    n.delete(key)
                    return n
                  })
                }, 5000)
                return next
              })
            }
          })
          setDevices(devList)
        }
      })

      // Listen to messages
      const msgsQ = query(collection(db, 'sessions', sessionId, 'messages'), orderBy('timestamp'))
      unsubMessages = onSnapshot(msgsQ, async (snap) => {
        for (const docChange of snap.docChanges()) {
          
          if (docChange.type === 'added') {
            const m = docChange.doc.data()

            const ownPub = ownPubRef.current
            if (ownPub && m.recipientPublicKeyBase64 === ownPub) {
              if (!privateKeyRef.current) continue
              try {
                const senderPub = await importPublicKey(m.senderPublicKeyBase64)
                const sym = await deriveSharedSymmetricKey(privateKeyRef.current, senderPub)
                const plain = await decryptText(m.cipherText, m.iv, sym)
                setMessages(prev => [...prev, { ...m, plain }])
              } catch (e: any) {
                console.error('Failed to decrypt message for us', e)
              }
            }
          }
        }
      })
    }

    init()

    return () => {
      if (unsubSession) unsubSession()
      if (unsubMessages) unsubMessages()
      if (unsubDevices) unsubDevices()
    }
  }, [sessionId, router])

  if (!sessionId) return <div>Loading...</div>;

  return (
    <div className="flex h-[calc(100vh-148px)] overflow-hidden">
      {isCreator && (
        <div className="w-1/4 bg-white border-r border-gray-300 hidden md:block">
          <SessionHeader 
            title="Devices" 
            iconLeft={<IoMdClipboard />} 
            actionIconLeft={() => {}} 
            contentRight={<span className="inline-flex items-center px-2.5 py-1.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                <MdPhonelink className='mr-3' />{sessionMeta.type === 'pro' ? 'Devices: Unlimited' : `${sessionMeta.deviceCount || 0} / ${sessionMeta.deviceLimit}`}
              </span>} 
            isAuthenticated={user !== undefined} 
            isCreator={isCreator} 
            showContentRignt={true} />
          
          <div className="relative">
            <div className="flex flex-col items-center justify-center border-b border-slate-300 p-4">
              {sessionMeta ? (
                <QRCodeView text={`${baseUrl}/session/${sessionId}/join`} />
              ) : <div className='m-4'>Loading...</div>}
            </div>
            <div className="overflow-y-auto h-2/4 p-3 mb-4">
              {devices.length ? <DeviceList devices={devices} newDeviceKeys={newDeviceKeys} /> : <li className="text-gray-500">No devices yet</li>}
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 bg-white">
          <SessionHeader 
            title="Texts" 
            iconLeft={<MdPhonelink />} 
            actionIconLeft={() => {}} 
            contentRight={
              <Link 
                href={`/session`} 
                className="bg-slate-100 text-red-500 dark:bg-gray-950 w-[2rem] h-[2rem] bg-opacity-80 backdrop-blur-[0.5rem] border border-white border-opacity-40 shadow-2xl rounded-full flex items-center justify-center hover:scale-[1.15] active:scale-105 transition-all">
                  <FaTimes />
              </Link>
            } 
            isAuthenticated={user !== undefined} 
            isCreator={isCreator} 
            showContentRignt={user !== undefined && isCreator} />
          
          <div className="h-[calc(100vh-280px)] overflow-y-auto px-0 pb-1">
            <TextList messages={messages} />
          </div>
          
          <footer className={`bg-white border-t border-slate-300 w-${isCreator ? '3/4' : 'full'}`}>
            <SendTextForm sessionId={sessionId} sessionMeta={sessionMeta} devices={devices} />
          </footer>
      </div>
    </div>
  )
}

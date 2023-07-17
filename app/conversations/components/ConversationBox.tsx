'use client';

import { useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Conversation, Message, User } from '@prisma/client';
import { format } from 'date-fns';
import { useSession } from 'next-auth/react';
import { FullConversationType } from '@/app/types';
import useOtherUser from '@/app/hooks/useOtherUser';
import clsx from 'clsx';
import Avatar from '@/app/components/Avatar';
import AvatarGroup from '@/app/components/AvatarGroup';

interface ConversationBoxProps {
    data: FullConversationType,
    selected?: boolean;
}

const ConversationBox: React.FC<ConversationBoxProps> = ({
    data,
    selected
}) => {
    const otherUser = useOtherUser(data);
    const session = useSession();
    const router = useRouter();

    const handelClick = useCallback(() => {
        router.push(`/conversations/${data.id}`);
    }, [data.id, router]);

    const lastMessage = useMemo(() => {
        const messages = data.messages || [];

        return messages[messages.length - 1];
    }, [data.messages]);

    const userEmail = useMemo(() => {
        return session.data?.user?.email;
    }, [session.data?.user?.email]);

    const hasSeen = useMemo(() => {
        if (!lastMessage) {
            return false;
        }

        const seenArray = lastMessage.seen || [];

        if (!userEmail) {
            return false;
        }

        return seenArray
            .filter((user) => user.email === userEmail).length !== 0;
    }, [userEmail, lastMessage]);

    const lastMessageText = useMemo(() => {
        if (lastMessage?.image) {
            return 'Sent an image';
        }

        if (lastMessage?.body) {
            return lastMessage.body;
        }

        return 'Started a conversation';
    }, [lastMessage]);

    // const unreadMessageNum = useMemo(() => {
    //     // const unReededMessage = data.messages.filter((u) => u.seen.length === 1);
    //     // console.log(unReededMessage, 'unReededMessage!!!');

    //     if (data.messages.length !== 0 && data.messages.map((m) => m.seen.length === 1)) {
    //         debugger
    //         // if (data.messages.length > 9) {
    //         //     return "9+"
    //         // }
    //         return "🟢";
    //     }
    // }, [data.messages]);

    return (
        <div
            onClick={handelClick}
            className={clsx(`
            w-full 
            relative 
            flex 
            items-center 
            space-x-3 
            p-3 
            hover:bg-neutral-100
            rounded-lg
            transition
            cursor-pointer
            `,
                selected ? 'bg-neutral-100' : 'bg-white'
            )}
        >
            {data.isGroup ? (
                <AvatarGroup users={data.users} />
            ) : (
                <Avatar user={otherUser} />
            )}
            <div className="
                    min-w-0 
                    flex-1
                "
            >
                <div className="
                        focus:outline-none
                    "
                >
                    <div className="
                            flex    
                            justify-between
                            items-center 
                            mb-1
                        "
                    >
                        <p className='
                            text-md 
                            font-medium 
                            text-gray-900
                            '
                        >
                            {data.name || otherUser.name}
                        </p>
                        {lastMessage?.createdAt && (
                            <p className='text-xs text-gray-400 font-light'>
                                {format(new Date(lastMessage.createdAt), 'p')}
                            </p>
                        )}
                    </div>
                    <div className="flex justify-between">
                        <p
                            className={clsx(`
                            truncate
                            text-sm
                        `,
                                hasSeen ? 'text-gray-500' : 'text-black font-medium'
                            )}
                        >
                            {lastMessageText}
                        </p>
                        {/* {unreadMessageNum && !hasSeen && (
                            <p className='
                                    flex
                                    justify-center
                                    rounded-full
                                    text-xs
                                    p-1
                                    bg-sky-500 
                                    cursor-pointer 
                                    transition 
                            '>
                                {unreadMessageNum}
                            </p>
                        )} */}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ConversationBox
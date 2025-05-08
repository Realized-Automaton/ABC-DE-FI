
'use client';

import * as React from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { SidebarMenu, SidebarMenuItem, SidebarMenuButton } from '@/components/ui/sidebar';
import { BookOpen, Gamepad2, Trophy, BarChart3, Settings, AlertTriangle } from 'lucide-react'; // Added AlertTriangle

// Define navigation items - SWAPPED Quests and Challenges labels/icons
const navItems = [
    { href: '/', label: 'DeFi Basics', icon: <BookOpen />, tooltip: 'DeFi Basics' }, // Was Challenges (Gamepad2), now DeFi Basics (BookOpen)
    { href: '/challenges', label: 'Scam Quests', icon: <Gamepad2 />, tooltip: 'Scam Quests' }, // Was Scam Quests (BookOpen), now Scam Quests (Gamepad2)
    { href: '/badges', label: 'Badges', icon: <Trophy />, tooltip: 'Badges' },
    { href: '/leaderboard', label: 'Leaderboard', icon: <BarChart3 />, tooltip: 'Leaderboard' },
    { href: '/settings', label: 'Settings', icon: <Settings />, tooltip: 'Settings' },
];

export function SidebarNavigation() {
    const pathname = usePathname();

    return (
        <SidebarMenu>
            {navItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                    <Link href={item.href} passHref>
                        <SidebarMenuButton
                            tooltip={item.tooltip}
                            isActive={pathname === item.href}
                        >
                            {item.icon} {item.label}
                        </SidebarMenuButton>
                    </Link>
                </SidebarMenuItem>
            ))}
        </SidebarMenu>
    );
}




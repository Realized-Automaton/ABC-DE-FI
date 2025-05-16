
'use client';

import * as React from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { SidebarMenu, SidebarMenuItem, SidebarMenuButton } from '@/components/ui/sidebar';
import { BookOpen, Gamepad2, Trophy, BarChart3, Settings, Lock } from 'lucide-react'; // Added Lock icon
import { useUser } from '@/context/user-context'; // Import useUser

const navItems = [
    { href: '/', label: 'DeFi Basics', icon: <BookOpen />, tooltip: 'DeFi Basics' },
    { href: '/challenges', label: 'Scam Quests', icon: <Gamepad2 />, tooltip: 'Scam Quests' },
    { href: '/badges', label: 'Badges', icon: <Trophy />, tooltip: 'Badges' },
    { href: '/leaderboard', label: 'Leaderboard', icon: <BarChart3 />, tooltip: 'Leaderboard' },
    { href: '/settings', label: 'Settings', icon: <Settings />, tooltip: 'Settings' },
];

export function SidebarNavigation() {
    const pathname = usePathname();
    const { easterEggActivated } = useUser(); // Get the easter egg state

    return (
        <SidebarMenu>
            {navItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                    <Link href={item.href} passHref legacyBehavior>
                        <SidebarMenuButton
                            asChild // Allow Link to control navigation
                            tooltip={item.tooltip}
                            isActive={pathname === item.href}
                        >
                            <a> {/* Content of the button is now inside an <a> tag */}
                                {item.icon} {item.label}
                            </a>
                        </SidebarMenuButton>
                    </Link>
                </SidebarMenuItem>
            ))}
            {easterEggActivated && (
                <SidebarMenuItem>
                    <SidebarMenuButton
                        asChild
                        tooltip="Privacy"
                        isActive={false} // This link won't match internal paths
                    >
                        <a
                            href="https://crypto-cloak.vercel.app/"
                            target="_blank"
                            rel="noopener noreferrer"
                            // className="flex items-center gap-2" // SidebarMenuButton should handle styling
                        >
                            <Lock /> Privacy
                        </a>
                    </SidebarMenuButton>
                </SidebarMenuItem>
            )}
        </SidebarMenu>
    );
}

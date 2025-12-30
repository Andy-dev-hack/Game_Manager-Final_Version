/**
 * StatsSection.tsx
 * Displays platform statistics (Dynamic Games count + Users + Collections).
 * Fetches real global stats from backend.
 */
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { FaGamepad, FaUsers, FaShoppingBag, FaCode, FaBan } from "react-icons/fa";
import { useQuery } from "@tanstack/react-query";
import { statsService } from "../../../services/stats.service";
import styles from "./StatsSection.module.css";
import React from "react";

interface StatItemProps {
    icon: React.ElementType;
    value: string | number;
    label: string;
    delay?: number;
}

const StatItem = ({ icon: Icon, value, label, delay = 0 }: StatItemProps) => {
    return (
        <motion.div
            className={styles.statItem}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay }}
        >
            <Icon className={styles.icon} />
            <motion.span
                className={styles.number}
                initial={{ opacity: 0, scale: 0.5 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: delay + 0.2, type: "spring" }}
            >
                {value}
            </motion.span>
            <span className={styles.label}>{label}</span>
        </motion.div>
    );
};

export const StatsSection = () => {
    const { t } = useTranslation();

    // Fetch real global stats
    const { data, isLoading } = useQuery({
        queryKey: ["global-stats"],
        queryFn: statsService.getGlobalStats,
        staleTime: 1000 * 60 * 15, // 15 minutes cache
    });

    const totalGames = data?.totalGames || 0;
    const totalUsers = data?.totalUsers || 0;
    const totalCollections = data?.totalCollections || 0;

    return (
        <motion.div
            className={styles.container}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
        >
            {/* Dynamic: Games Available */}
            <StatItem icon={FaGamepad} value={isLoading ? "..." : totalGames} label={t("home.stats.games")} delay={0} />

            {/* Dynamic: Active Users */}
            <StatItem icon={FaUsers} value={isLoading ? "..." : totalUsers} label={t("home.stats.users")} delay={0.1} />

            {/* Dynamic: Collections (UserGame count) */}
            <StatItem
                icon={FaShoppingBag}
                value={isLoading ? "..." : totalCollections}
                label={t("home.stats.collections")}
                delay={0.2}
            />

            {/* Value Prop: Open Source (Hardcoded) */}
            <StatItem icon={FaCode} value="100%" label={t("home.stats.open_source")} delay={0.3} />

            {/* Value Prop: Zero Ads (Hardcoded) */}
            <StatItem icon={FaBan} value={t("home.stats.no_ads")} label={t("home.stats.trusted")} delay={0.4} />
        </motion.div>
    );
};

import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { IconName } from "@fortawesome/fontawesome-svg-core";
import {
  Card,
  Button,
  Tag,
  // Input,
  // Select,
  Space,
  Badge,
  Empty,
  Divider,
  Popover,
  Tooltip
} from "antd";
import {
  // SearchOutlined,
  // FilterOutlined,
  BookOutlined,
  InfoCircleOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  // SortAscendingOutlined,
  FireOutlined,
  RocketOutlined
} from "@ant-design/icons";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useGetMatiere } from "../../../Services/Admin/Matieres/useGetMatiere";
import { getMatiereLevelId } from "../../../Services/Admin/Matieres/typeMatiere";
import type { typeMatiere } from "../../../Services/Admin/Matieres/typeMatiere";
import SpinnerLoader from "../../../ui/SpinnerLoader";

// const { Option } = Select;

/* =======================
Animations
======================= */
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

const cardVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.9 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      damping: 15,
      stiffness: 100
    }
  },
  hover: {
    y: -8,
    scale: 1.02,
    boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 15
    }
  },
  tap: {
    scale: 0.98
  }
};


/* =======================
Component
======================= */
const MatieresViewStudent = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";

  const [searchText, setSearchText] = useState("");
  const [semesterFilter, setSemesterFilter] = useState("all");
  const [difficultyFilter, setDifficultyFilter] = useState("all");
  // const [sortBy, setSortBy] = useState("name");
  const [selectedMatiere, setSelectedMatiere] = useState<typeMatiere | null>(null);
  const [isDetailVisible, setIsDetailVisible] = useState(false);

  const { data: matieresData, isPending } = useGetMatiere();

  // Statistiques calculées
  const safeMatieres = Array.isArray(matieresData) ? matieresData : [];

  const stats = {
    total: safeMatieres.length,
    active: safeMatieres.filter(m => m?.is_active === true).length,
    credits: safeMatieres.reduce((acc, curr) => acc + (curr?.unit_count || 0), 0),
    semesters: new Set(safeMatieres.map(m => getMatiereLevelId(m?.level))).size
  };

  // Niveaux de difficulté (exemple)
  const getDifficultyLevel = (matiere: typeMatiere) => {
    const base = matiere.unit_count || 1;
    if (base >= 4) return { level: "hard", color: "red", icon: <FireOutlined /> };
    if (base >= 3) return { level: "medium", color: "orange", icon: <RocketOutlined /> };
    return { level: "easy", color: "green", icon: <CheckCircleOutlined /> };
  };

  // Fonction de filtrage

  const filteredMatieres = safeMatieres
    .filter(matiere => {
      const matchesSearch =
        matiere?.name?.toLowerCase()?.includes(searchText.toLowerCase()) ||
        matiere?.description?.toLowerCase()?.includes(searchText.toLowerCase());

      const matchesSemester =
        semesterFilter === "all" ||
        getMatiereLevelId(matiere?.level)?.toString() === semesterFilter;

      const difficulty = getDifficultyLevel(matiere);

      const matchesDifficulty =
        difficultyFilter === "all" ||
        difficulty.level === difficultyFilter;

      return matchesSearch && matchesSemester && matchesDifficulty;
    })
  //   .sort((a, b) => {
  //     switch (sortBy) {
  //       case "name":
  //         return a.name.localeCompare(b.name);
  //       case "semester":
  //         return (a.grade || 0) - (b.grade || 0);
  //       case "difficulty":
  //         return (b.unit_count || 0) - (a.unit_count || 0);
  //       default:
  //         return 0;
  //     }
  //   }
  // );

  // Animation pour la vue détail
  const detailVariants = {
    hidden: { opacity: 0, x: 100 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 20
      }
    },
    exit: {
      opacity: 0,
      x: -100,
      transition: { duration: 0.2 }
    }
  };

  if (isPending) {
    return <SpinnerLoader />;
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      dir={isRTL ? "rtl" : "ltr"}
      className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4 md:p-6"
    >
      {/* Header avec animations */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8 text-center"
      >
        <h1 className="text-4xl md:text-5xl font-bold !bg-main-color bg-clip-text text-transparent mb-3">
          {t("matieres.student.title")}
        </h1>
        <p className="text-gray-600 text-lg max-w-2xl mx-auto">
          {t("matieres.student.subtitle")}
          <span className="font-semibold !text-main-color"> {stats.total} </span>
          {t("matieres.student.subjectsAvailable")}
        </p>
      </motion.div>


      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mb-8"
      >
        <Card className="rounded-2xl shadow-md border-0 bg-white/80 backdrop-blur-sm">
          <div className="flex flex-col lg:flex-row justify-between gap-4 items-center">
            <div className="flex-1 w-full">
              {/* <Input
                placeholder={t("matieres.student.searchPlaceholder")}
                prefix={<SearchOutlined className="text-gray-400" />}
                value={searchText}
                onChange={e => setSearchText(e.target.value)}
                className="rounded-full h-12 text-base"
                allowClear
                size="large"
              /> */}
            </div>

            {/* <Space wrap className="flex flex-wrap justify-center gap-3">

              <Select
                value={difficultyFilter}
                onChange={setDifficultyFilter}
                className="w-40"
                size="large"
                suffixIcon={<FilterOutlined />}
                placeholder={t("matieres.filters.difficulty")}
              >
                <Option value="all">{t("matieres.filters.allLevels")}</Option>
                <Option value="easy">{t("matieres.difficulty.easy")}</Option>
                <Option value="medium">{t("matieres.difficulty.medium")}</Option>
                <Option value="hard">{t("matieres.difficulty.hard")}</Option>
              </Select>

              <Select
                value={sortBy}
                onChange={setSortBy}
                className="w-40"
                size="large"
                suffixIcon={<SortAscendingOutlined />}
                placeholder={t("matieres.sort.title")}
              >
                <Option value="name">{t("matieres.sort.byName")}</Option>
                <Option value="semester">{t("matieres.sort.bySemester")}</Option>
                <Option value="difficulty">{t("matieres.sort.byDifficulty")}</Option>
              </Select>

              <Button
                icon={<FilterOutlined />}
                onClick={() => {
                  setSearchText("");
                  setSemesterFilter("all");
                  setDifficultyFilter("all");
                  setSortBy("name");
                }}
                size="large"
                className="rounded-full"
              >
                {t("matieres.filters.reset")}
              </Button>
            </Space> */}
          </div>

          {/* Info résultats */}
          <div className="mt-4 text-center">
            <span className="text-gray-600">
              {t("matieres.student.showing")} <span className="font-bold text-blue-600">{filteredMatieres.length}</span>
              {t("matieres.student.of")} <span className="font-bold">{stats.total}</span> {t("matieres.student.subjects")}
            </span>
          </div>
        </Card>
      </motion.div>

      {/* Grille des matières */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {filteredMatieres.length > 0 ? (
            filteredMatieres.map((matiere, index) => {
              // const difficulty = getDifficultyLevel(matiere);

              return (
                <motion.div
                  key={matiere.id}
                  variants={{ cardVariants }}
                  whileHover="hover"
                  whileTap="tap"
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  transition={{ delay: index * 0.05 }}
                  layout
                >
                  <Card
                    className="rounded-2xl border-0 shadow-lg hover:shadow-2xl h-full cursor-pointer transition-all duration-300 overflow-hidden group"
                    onClick={() => {
                      setSelectedMatiere(matiere);
                      setIsDetailVisible(true);
                    }}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <Badge
                          status={matiere.is_active ? "success" : "error"}
                          text={
                            <span className={`text-sm font-medium ${matiere.is_active ? 'text-green-600' : 'text-red-500'}`}>
                              {matiere.is_active ? t("matieres.status.active") : t("matieres.status.inactive")}
                            </span>
                          }
                        />
                        <h3 className="text-xl font-bold text-gray-800 mt-2 group-hover:text-blue-600 transition-colors">
                          {matiere.name}
                        </h3>
                      </div>
                      <div className="flex flex-col items-end">
                        <Tag
                          color="blue"
                          className="rounded-full px-3 py-1 font-semibold mb-2"
                        >
                          {t("matieres.semester")} {getMatiereLevelId(matiere.level) ?? "—"}
                        </Tag>
                        <Tooltip title={matiere.name}>
                          <div
                            className="w-10 h-10 rounded-full flex items-center justify-center text-white"
                            style={{ backgroundColor: matiere.color }}
                          >
                            <FontAwesomeIcon
                              icon={["fas", (matiere.icon || "question") as IconName]}
                            />
                          </div>
                        </Tooltip>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-gray-600 mb-6 line-clamp-3">
                      {matiere.description || t("matieres.student.noDescription")}
                    </p>

                    {/* Footer de la carte */}
                    <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                      <div className="flex items-center space-x-4">
                        <span className="flex items-center text-gray-500">
                          <BookOutlined className="mr-2" />
                          <span className="font-semibold">{matiere.unit_count || 0} {t("matieres.credits")}</span>
                        </span>
                        <Popover content={t("matieres.student.clickForDetails")}>
                          <InfoCircleOutlined className="text-blue-400 hover:text-blue-600 cursor-help" />
                        </Popover>
                      </div>
                      <Button
                        ghost
                        className="rounded-full !bg-main-color !text-white  transition-all"
                      >
                        {t("matieres.student.viewDetails")}
                      </Button>
                    </div>

                    {/* Effet de surbrillance au hover */}
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/0 to-purple-500/0 group-hover:from-blue-500/5 group-hover:via-blue-500/10 group-hover:to-purple-500/5 transition-all duration-500 pointer-events-none" />
                  </Card>
                </motion.div>
              );
            })
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="col-span-full"
            >
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={
                  <span className="text-gray-500 text-lg">
                    {t("matieres.student.noResults")}
                  </span>
                }
                className="py-12"
              >
                <Button
                  onClick={() => {
                    setSearchText("");
                    setSemesterFilter("all");
                    setDifficultyFilter("all");
                  }}
                  size="large"
                  className="rounded-full px-8"
                >
                  {t("matieres.student.resetFilters")}
                </Button>
              </Empty>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Modal de détails */}
      <AnimatePresence>
        {isDetailVisible && selectedMatiere && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
              onClick={() => setIsDetailVisible(false)}
            />

            {/* Panel de détails */}
            <motion.div
              variants={{ detailVariants }}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="fixed top-0 right-0 h-full w-full md:w-1/2 lg:w-1/3 bg-white z-50 shadow-2xl overflow-y-auto"
            >
              <div className="p-6">
                {/* Header */}
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <Button
                      icon={<span className="text-xl">×</span>}
                      type="text"
                      onClick={() => setIsDetailVisible(false)}
                      className="text-gray-500 hover:text-gray-700"
                    />
                  </div>
                  <Tag color="blue" className="rounded-full px-4 py-1 text-base">
                    {t("matieres.semester")} {getMatiereLevelId(selectedMatiere.level) ?? "—"}
                  </Tag>
                </div>

                {/* Titre */}
                <h2 className="text-3xl font-bold text-gray-800 mb-4">
                  {selectedMatiere.name}
                </h2>

                {/* Statut */}
                <div className="flex items-center mb-6">
                  <Badge
                    status={selectedMatiere.is_active ? "success" : "error"}
                    className="mr-3"
                  />
                  <span className={`text-lg ${selectedMatiere.is_active ? 'text-green-600' : 'text-red-500'}`}>
                    {selectedMatiere.is_active ? t("matieres.status.active") : t("matieres.status.inactive")}
                  </span>
                </div>

                {/* Description complète */}
                <div className="mb-8">
                  <h3 className="text-xl font-semibold text-gray-700 mb-3 flex items-center">
                    <FileTextOutlined className="mr-2 text-blue-500" />
                    {t("matieres.student.description")}
                  </h3>
                  <p className="text-gray-600 text-lg leading-relaxed">
                    {selectedMatiere.description || t("matieres.student.noDescriptionAvailable")}
                  </p>
                </div>

                {/* Statistiques détaillées */}
                <div className="grid grid-cols-2 gap-4 mb-8">
                  <Card className="rounded-xl border border-gray-200">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600 mb-2">
                        {selectedMatiere.unit_count || 0}
                      </div>
                      <div className="text-gray-600">{t("matieres.credits")}</div>
                    </div>
                  </Card>
                  <Card className="rounded-xl border border-gray-200">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600 mb-2">
                        {getMatiereLevelId(selectedMatiere.level) ?? "—"}
                      </div>
                      <div className="text-gray-600">{t("matieres.semester")}</div>
                    </div>
                  </Card>
                </div>

                {/* Difficulté */}
                <div className="mb-8">
                  <h3 className="text-xl font-semibold text-gray-700 mb-3 flex items-center">
                    <RocketOutlined className="mr-2 text-orange-500" />
                    {t("matieres.difficulty.title")}
                  </h3>
                  <div className="flex items-center">
                    {(() => {
                      const difficulty = getDifficultyLevel(selectedMatiere);
                      return (
                        <>
                          <div className={`w-12 h-12 rounded-full bg-gradient-to-br from-${difficulty.color}-500 to-${difficulty.color}-600 flex items-center justify-center text-white mr-4`}>
                            {difficulty.icon}
                          </div>
                          <div>
                            <div className="text-lg font-semibold">
                              {t(`matieres.difficulty.${difficulty.level}`)}
                            </div>
                            <div className="text-gray-500">
                              {t(`matieres.difficulty.${difficulty.level}Description`)}
                            </div>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-6 border-t border-gray-200">
                  <Space className="w-full" direction="vertical">
                    {/* <Button
                      type="primary"
                      size="large"
                      block
                      className="rounded-full h-12"
                    >
                      {t("matieres.student.enrollNow")}
                    </Button> */}
                    <Button
                      size="large"
                      block
                      className="rounded-full h-12"
                      onClick={() => setIsDetailVisible(false)}
                    >
                      {t("matieres.student.close")}
                    </Button>
                  </Space>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Instructions */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="mt-12 text-center"
      >
        <Divider>
          <span className="text-gray-400 text-sm">
            <InfoCircleOutlined className="mr-2" />
            {t("matieres.student.tip")}
          </span>
        </Divider>
        <p className="text-gray-500 max-w-2xl mx-auto">
          {t("matieres.student.instruction")}
        </p>
      </motion.div>
    </motion.div>
  );
};

export default MatieresViewStudent;


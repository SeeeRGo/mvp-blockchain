"use client";

import { useEffect } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

/**
 * Компонент для инициализации демонстрационного университета в базе данных
 * Этот компонент должен быть включен в макет вашего приложения или на главной странице, чтобы убедиться,
 * что демонстрационный университет существует до того, как пользователи попытаются создать дипломы
 */
export default function DatabaseInitializer() {
  const ensureDemoUniversity = useMutation(api.universities.ensureDemoUniversity);

  useEffect(() => {
    // Инициализация демонстрационного университета при монтировании компонента
    const init = async () => {
      try {
        await ensureDemoUniversity();
        console.log("Демонстрационный университет успешно инициализирован");
      } catch (error) {
        console.error("Не удалось инициализировать демонстрационный университет:", error);
      }
    };

    init();
  }, [ensureDemoUniversity]);

  // Этот компонент ничего не отображает
  return null;
}

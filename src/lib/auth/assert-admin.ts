import { auth } from '@/auth';

// Для server actions, которые возвращают { success, error }
export async function getAdminSession() {
  const session = await auth();
  if (!session?.user || session.user.role !== 'ADMIN') return null;
  return session;
}

// Для действий, где допустимо бросить исключение
export async function assertAdmin() {
  const session = await auth();
  if (!session?.user) throw new Error('Unauthorized');
  if (session.user.role !== 'ADMIN') throw new Error('Forbidden');
  return session;
}
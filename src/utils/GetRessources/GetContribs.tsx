import axios from 'axios';
import teams from '../../utils/data/teams.json';

interface Contributor {
  login: string;
  avatar_url: string;
  html_url: string;
}

export async function getContributors(): Promise<Contributor[]> {
  try {
    const { data: allContributors } = await axios.get<Contributor[]>('https://api.github.com/repos/PapillonApp/Papillon/contributors');
    
    const teamGithubUrls = new Set(
      teams
        .filter(({ github }) => github)
        .map(({ github }) => github.toLowerCase())
    );

    return allContributors.filter(({ html_url }) =>
      !teamGithubUrls.has(new URL(html_url).hostname.replace('www.', ''))
    );
  } catch (error) {
    console.error('Erreur lors de la récupération des contributeurs:', error);
    return [];
  }
}

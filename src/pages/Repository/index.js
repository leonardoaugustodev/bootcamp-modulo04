import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';

import { thisExpression } from '@babel/types';
import api from '../../services/api';
import { Loading, Owner, IssuesList, Control } from './styles';
import Container from '../../components/Container/index';

class Repository extends Component {
  static propTypes = {
    match: PropTypes.shape({
      params: PropTypes.shape({
        repository: PropTypes.string,
      }),
    }).isRequired,
  };

  state = {
    repository: {},
    issues: [],
    loading: true,
    status: 'open',
    statusList: ['open', 'closed', 'all'],
    perPage: 5,
    page: 1,
  };

  async componentDidMount() {
    this.refreshIssueList();
  }

  async componentDidUpdate(_, prevState) {
    const { status, page } = this.state;
    if (status !== prevState.status || page !== prevState.page) {
      this.refreshIssueList();
    }
  }

  handleChangeStatus = status => {
    this.setState({
      status,
    });
  };

  handleChangePage = pageAddSub => {
    const { page } = this.state;

    let pageTotal = page + pageAddSub;

    if (pageTotal === 0) {
      pageTotal = 1;
    }

    this.setState({
      page: pageTotal,
    });
  };

  async refreshIssueList() {
    const { match } = this.props;

    const repoName = decodeURIComponent(match.params.repository);
    const { status, perPage, page } = this.state;

    const [repository, issues] = await Promise.all([
      api.get(`/repos/${repoName}`),
      api.get(`/repos/${repoName}/issues`, {
        params: {
          state: status,
          per_page: perPage,
          page,
        },
      }),
    ]);

    this.setState({
      repository: repository.data,
      issues: issues.data,
      loading: false,
    });
  }

  render() {
    const { repository, issues, loading, statusList, page } = this.state;

    if (loading) {
      return <Loading>Carregando</Loading>;
    }
    return (
      <Container>
        <Owner>
          <Link to="/">Voltar aos repositórios</Link>
          <img src={repository.owner.avatar_url} alt={repository.owner.login} />
          <h1>{repository.name}</h1>
          <p>{repository.description}</p>
        </Owner>
        <Control>
          {statusList.map(status => (
            <button
              key={status}
              type="button"
              onClick={() => this.handleChangeStatus(status)}
            >
              {status}
            </button>
          ))}
          <button
            type="button"
            onClick={() => this.handleChangePage(-1)}
            disabled={page == 1}
          >
            anterior
          </button>
          <button type="button" onClick={() => this.handleChangePage(+1)}>
            próxima
          </button>
        </Control>

        <IssuesList>
          {issues.map(issue => (
            <li key={String(issue.id)}>
              <img src={issue.user.avatar_url} alt={issue.user.login} />
              <div>
                <strong>
                  <a href={issue.html_url}>{issue.title}</a>
                  {issue.labels.map(label => (
                    <span key={String(label.id)}>{label.name}</span>
                  ))}
                </strong>
                <p>{issue.user.login}</p>
              </div>
            </li>
          ))}
        </IssuesList>
      </Container>
    );
  }
}

export default Repository;
